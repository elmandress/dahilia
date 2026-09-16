-- ============================================================
-- Dahila Crochet · Seguridad del panel (seguridad-2026-09.sql)
-- Supabase → SQL Editor → pegar TODO → Run. Una sola vez alcanza; si se
-- corre de nuevo no rompe nada. Supabase muestra "Potential issues":
--   * "destructive operations": es esperado (borra permisos viejos).
--   * "creates a table without enabling Row Level Security": es
--     _seguridad_cerrados, una tabla TEMPORAL que solo existe mientras corre
--     el script y nadie puede leer desde el sitio. Elegí "Run without RLS"
--     ("Run and enable RLS" agrega una línea que puede tapar la tabla final).
-- ============================================================
-- Por qué (verificado en vivo el 14/09/2026 con la clave pública):
--   * El registro de cuentas de Supabase sigue ABIERTO: cualquiera puede
--     crearse una cuenta. Y con los permisos de hoy, "cualquier cuenta" puede
--     editar productos, precios, textos y fotos, y leer suscriptoras,
--     encargos y postulaciones de tejedoras (datos personales).
--   * get_daily_summary() (carritos y encargos del negocio) la puede llamar
--     cualquiera, sin cuenta.
--
-- Qué hace, en orden:
--   1. Se asegura de que existan la tabla `admins` y la función is_admin().
--   2. Te anota como admin con el mail de abajo. Si no encuentra esa cuenta,
--      frena y NO cambia nada: no hay forma de quedarte afuera del panel.
--   3. Busca los permisos "cualquier cuenta puede todo" por su CONTENIDO (no
--      por el nombre: la vez pasada un nombre con espacio se colaba) y los
--      cambia por "solo admin". Los formularios públicos (encargo, lista VIP,
--      tejedoras, pedidos) no se tocan: siguen andando igual.
--   4. Lo mismo con las fotos (bucket `media`): subir, cambiar y borrar,
--      solo admin. Verlas sigue siendo público.
--   5. get_daily_summary() deja de ser pública (el resumen diario pasa a
--      usar la clave de servicio del servidor).
--   6. Termina con una tabla: el resultado, qué se cerró y qué cuentas hay.
--
-- Además, en el panel de Supabase (1 minuto, no se puede con SQL):
--   Authentication → Sign In / Providers → apagar "Allow new users to sign up".
--
-- Reemplaza a los PASOS 1 a 3 de schema-security-hardening.sql (que nunca se
-- corrieron y había que descomentar a mano).
-- ============================================================


-- 1) admins + is_admin() (mismas definiciones que schema-orders.sql)
CREATE TABLE IF NOT EXISTS public.admins (
  user_id    uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No client access to admins" ON public.admins;
CREATE POLICY "No client access to admins" ON public.admins FOR SELECT USING (false);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid());
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Anotador de lo que se cierra, para la tabla del final.
CREATE TEMP TABLE IF NOT EXISTS _seguridad_cerrados (detalle text);
TRUNCATE _seguridad_cerrados;


-- 2) a 5) Todo junto: si algo falla, no queda nada a medias.
DO $$
DECLARE
  -- ▼▼▼ ÚNICO DATO: el mail con el que entrás al panel, entre comillas. ▼▼▼
  admin_email text := 'PONE_TU_MAIL_ACA';
  -- ▲▲▲ Si ya estás anotada como admin, podés dejarlo así.            ▲▲▲
  found_id uuid;
  r record;
  t text;
  tablas text[] := '{}';
BEGIN
  -- 2) Admin
  IF admin_email <> 'PONE_TU_MAIL_ACA' THEN
    SELECT id INTO found_id FROM auth.users WHERE lower(email) = lower(trim(admin_email)) LIMIT 1;
    IF found_id IS NULL THEN
      RAISE EXCEPTION 'No hay ninguna cuenta con el mail "%" (mirá Authentication → Users). No se cambió nada.', admin_email;
    END IF;
    INSERT INTO public.admins (user_id, email)
    VALUES (found_id, lower(trim(admin_email)))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.admins a JOIN auth.users u ON u.id = a.user_id) THEN
    RAISE EXCEPTION 'Todavía no hay ningún admin anotado: poné tu mail en admin_email (arriba) y volvé a correr. No se cambió nada.';
  END IF;

  -- 3) Tablas: "cualquier cuenta" (TO authenticated + USING/WITH CHECK true)
  --    pasa a "solo admin". Las policies TO public (formularios, lectura del
  --    catálogo) no entran en este filtro.
  FOR r IN
    SELECT tablename, policyname, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND roles = ARRAY['authenticated']::name[]
      AND permissive = 'PERMISSIVE'
      AND (qual = 'true' OR with_check = 'true')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, r.tablename);
    INSERT INTO _seguridad_cerrados VALUES (r.tablename || ' · "' || r.policyname || '" (' || r.cmd || ')');
    IF NOT (r.tablename::text = ANY (tablas)) THEN
      tablas := tablas || r.tablename::text;
    END IF;
  END LOOP;

  FOREACH t IN ARRAY tablas LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Solo admin ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      'Solo admin ' || t, t
    );
  END LOOP;

  -- 4) Fotos. En un bloque aparte: si Supabase no deja tocar storage desde el
  --    editor, queda anotado en la tabla final y lo demás se aplica igual.
  BEGIN
    FOR r IN
      SELECT policyname, cmd
      FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
        AND 'authenticated' = ANY (roles)
        AND cmd IN ('INSERT', 'UPDATE', 'DELETE', 'ALL')
        AND coalesce(qual, '') || coalesce(with_check, '') NOT LIKE '%is_admin%'
    LOOP
      EXECUTE format('DROP POLICY %I ON storage.objects', r.policyname);
      INSERT INTO _seguridad_cerrados VALUES ('fotos · "' || r.policyname || '" (' || r.cmd || ')');
    END LOOP;
    DROP POLICY IF EXISTS "Solo admin sube fotos" ON storage.objects;
    DROP POLICY IF EXISTS "Solo admin cambia fotos" ON storage.objects;
    DROP POLICY IF EXISTS "Solo admin borra fotos" ON storage.objects;
    CREATE POLICY "Solo admin sube fotos" ON storage.objects
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.is_admin());
    CREATE POLICY "Solo admin cambia fotos" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'media' AND public.is_admin())
      WITH CHECK (bucket_id = 'media' AND public.is_admin());
    CREATE POLICY "Solo admin borra fotos" ON storage.objects
      FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.is_admin());
  EXCEPTION WHEN insufficient_privilege THEN
    INSERT INTO _seguridad_cerrados VALUES ('ATENCIÓN: no se pudieron cambiar los permisos de las fotos (' || SQLERRM || ')');
  END;

  -- 5) get_daily_summary(): solo el servidor (clave de servicio).
  IF to_regprocedure('public.get_daily_summary()') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.get_daily_summary() FROM public, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.get_daily_summary() TO service_role;
    INSERT INTO _seguridad_cerrados VALUES ('get_daily_summary() · ya no la puede llamar cualquiera');
  END IF;
END $$;


-- 6) Resultado (esta tabla es lo que muestra el SQL Editor al terminar).
WITH abiertas AS (
  SELECT schemaname || '.' || tablename || ' · "' || policyname || '" (' || cmd || ')' AS detalle
  FROM pg_policies
  WHERE schemaname IN ('public', 'storage')
    AND (
      -- cualquier cuenta puede escribir sin ser admin
      ('authenticated' = ANY (roles) AND cmd <> 'SELECT'
        AND coalesce(qual, '') || coalesce(with_check, '') NOT LIKE '%is_admin%')
      -- cualquiera, sin cuenta, puede editar o borrar
      OR (roles && ARRAY['public', 'anon']::name[] AND cmd IN ('ALL', 'UPDATE', 'DELETE') AND qual = 'true')
    )
),
sin_rls AS (
  SELECT tablename::text AS detalle FROM pg_tables WHERE schemaname = 'public' AND NOT rowsecurity
)
SELECT 1 AS orden, 'Resultado' AS que,
  CASE WHEN NOT EXISTS (SELECT 1 FROM abiertas) AND NOT EXISTS (SELECT 1 FROM sin_rls)
    THEN 'OK. Solo las cuentas ADMIN pueden editar. Falta apagar el registro en Authentication, si no lo hiciste.'
    ELSE 'Quedan cosas para revisar (abajo). Pasale esta tabla a Claude.'
  END AS detalle
UNION ALL
SELECT 2, 'Cerrado ahora', detalle FROM _seguridad_cerrados
UNION ALL
SELECT 3, 'Cuenta', coalesce(u.email, '(sin mail)')
  || CASE WHEN a.user_id IS NOT NULL THEN '  →  ADMIN'
          ELSE '  →  sin permisos (si no la conocés, borrala en Authentication → Users)' END
  || '  · creada el ' || to_char(u.created_at, 'DD/MM/YYYY')
FROM auth.users u LEFT JOIN public.admins a ON a.user_id = u.id
UNION ALL
SELECT 4, 'Revisar: permiso abierto', detalle FROM abiertas
UNION ALL
SELECT 5, 'Revisar: tabla sin RLS', detalle FROM sin_rls
ORDER BY 1, 3;
