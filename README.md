# 🪡 Dahila Crochet — Boutique E-Commerce & Admin Panel

> Boutique online y sistema de gestión de prendas artesanales a medida. Diseñado y confeccionado a mano en Uruguay, construido con Next.js 15, Supabase y un diseño minimalista premium.

Este repositorio contiene la plataforma digital completa de **Dahila Crochet** y las especificaciones originales de su sistema de diseño.

---

## 🚀 Despliegue en Netlify

El proyecto está optimizado y listo para ser desplegado en Netlify vinculando directamente este repositorio Git.

### 1. Variables de Entorno (Environment Variables)
Configura las siguientes variables en la sección **Site configuration -> Environment variables** de Netlify:
* `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto de Supabase (ej: `https://yourproject.supabase.co`).
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`: API Key pública y anónima de Supabase.

### 2. Configuración de Construcción en Netlify
* **Base directory (Directorio base):** `dahilia-app`
* **Build command (Comando de construcción):** `npm run build`
* **Publish directory (Directorio de publicación):** `dahilia-app/.next`

---

## 🗄️ Inicialización de Base de Datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Entra al **SQL Editor** del dashboard de Supabase.
3. Copia y ejecuta el contenido del archivo [`database/schema.sql`](./database/schema.sql).
4. Esto creará automáticamente:
   * Las tablas del e-commerce (`categories`, `colors`, `products`, `product_media`, `product_sizes`, `custom_orders`, etc.).
   * El bucket de almacenamiento público llamado `media` para subir fotos y videos de productos.
   * Las políticas de seguridad **Row Level Security (RLS)** y las directivas de seguridad para el almacenamiento público.

---

## 💻 Desarrollo Local

Para correr la aplicación Next.js localmente en tu computadora:

1. Ingresa a la carpeta del proyecto:
   ```bash
   cd dahilia-app
   ```
2. Crea un archivo `.env.local` basado en `.env.example` y rellena tus credenciales de Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
   ```
3. Instala las dependencias y ejecuta el servidor de desarrollo:
   ```bash
   npm install
   npm run dev
   ```
4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Acceso al Panel de Administración
* URL: [http://localhost:3000/admin](http://localhost:3000/admin)
* Credenciales de prueba local (Bypass offline):
  * **Usuario:** `hola`
  * **Contraseña:** `hola`

---

## 📁 Estructura del Repositorio

```
.
├── README.md                  ← Este archivo
├── colors_and_type.css        ← Variables de diseño CSS base (Tokens)
├── database/
│   └── schema.sql             ← Script de base de datos y políticas RLS para Supabase
├── dahilia-app/               ← Aplicación Next.js 15 + Tailwind/Primitives CSS
│   ├── src/
│   │   ├── app/               ← Páginas públicas y rutas /admin
│   │   ├── components/        ← Componentes UI (Header, Footer, CartProvider)
│   │   └── lib/               ← Tipados y datos mock para fallback local
│   ├── netlify.toml           ← Archivo de configuración para despliegue en Netlify
│   └── package.json
├── assets/                    ← Logos e imágenes de producto originales
├── preview/                   ← Vistas estáticas del sistema de diseño
├── prints/                    ← Diseños de papelería e impresos
└── ui_kits/                   ← Prototipos HTML/JSX originales
```

---

## 🎨 SISTEMA DE DISEÑO (Identidad de Marca)

> Marca uruguaya de moda artesanal premium a crochet. Prendas personalizadas, hechas a mano, en pequeñas tandas y siempre a medida.

Este sistema de diseño captura la identidad visual y verbal de **Dahila Crochet** para que cada página web, lookbook, etiqueta y tarjeta impresa se sienta cohesionada. La estética buscada es **"chill, joven, hecho a mano"** — el blanco como lienzo, el crema en los recuadros, el rosa solo en los pequeños detalles. Mucho aire y espacio para respirar. Fotografía real y luz natural en primer plano. Voz de la fundadora: Anush, en primera persona, sin apuros.

### 🎭 Voz de la Marca
La voz de la marca es **en primera persona, coloquial Rioplatense**, escrita como si la fundadora le hablara a una amiga tomando mate. Nunca es corporativa. Transmite calidez, orgullo artesanal y expresiones locales (*pila de*, *al pie*, *a full*, voseo: *tenés*, *querés*, *contame*).

* **Primera persona del singular:** *"yo", "mi pasión", "abrí esta cuenta"*.
* **Voseo para dirigirse al lector:** *"contame", "tenés", "vos elegís"*.
* **Tono:** Cálido, cercano, exclusivo, sin prisa, con alma.

### 🎨 Colores Core
* **Blanco `#FFFFFF`** — El lienzo. Fondos de página, navegación y secciones principales.
* **Crema `#FAF1DF`** — Los recuadros. Tarjetas, chips, badges y bloques de proceso.
* **Rosa `#E693A7`** — Solo detalles. Badges de estado, color de hover en links, detalles tipográficos.
* **Ink `#1F1A1B`** — El texto. Contenido principal, botones primarios y tipografía.

### ✍️ Tipografías (Ligeras y etéreas)
* **Display: Fraunces 300** (Serif variable de peso liviano) — para títulos principales, nombres de productos y encabezados.
* **Body: Inter 300** (Sans-serif light) — para descripciones de producto, navegación y formularios. Altura de línea generosa (1.5–1.7).
* **Etiquetas/Eyebrows:** Inter 10–11px, mayúsculas, espaciado ancho (`0.22em`), color ink-500.
