'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify, mediaPath, prepareImageForUpload, STORAGE_CACHE_SECONDS } from '@/lib/media'
import { draftDescription } from '@/lib/description-draft'
import type { Category, Color, Collection } from '@/lib/types'

interface SizeEntry {
  tempId: string
  size: string
  price_uyu: string
  available: boolean
  sort_order: number
}

interface MediaEntry {
  tempId: string
  url: string
  type: 'image' | 'video'
  alt: string
  position: number
  is_primary: boolean
  uploading?: boolean
  progress?: number
  file?: File
}


export default function NuevoProductoPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [colors, setColors] = useState<Color[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [badge, setBadge] = useState('')
  const [status, setStatus] = useState<'draft' | 'active' | 'soldout'>('draft')
  const [basePriceUyu, setBasePriceUyu] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountActive, setDiscountActive] = useState(false)
  const [leadTimeMin, setLeadTimeMin] = useState('2')
  const [leadTimeMax, setLeadTimeMax] = useState('3')
  const [material, setMaterial] = useState('')
  const [careInstructions, setCareInstructions] = useState('')
  const [isCustomOnly, setIsCustomOnly] = useState(false)

  // Media
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([])

  // Sizes
  const [sizes, setSizes] = useState<SizeEntry[]>([])

  // Colors
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  // Drag reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const loadFormData = useCallback(async () => {
    const supabase = createClient()
    const [catRes, colRes, collRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('colors').select('*').order('sort_order'),
      supabase.from('collections').select('*').order('sort_order'),
    ])
    setCategories((catRes.data ?? []) as Category[])
    setColors((colRes.data ?? []) as Color[])
    if (collRes.data) setCollections(collRes.data as Collection[])
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFormData()
  }, [loadFormData])

  // Auto-slug from name when user hasn't manually overridden the slug.
  useEffect(() => {
    if (!slugManual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlug(slugify(name))
    }
  }, [name, slugManual])

  // ---- Media upload ----
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const supabase = createClient()
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      if (!isVideo && !isImage) continue

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
      // Comprimir ANTES de subir (≤1600px, JPEG) — ver lib/media.ts: el
      // egress de Supabase se paga por byte descargado, y el byte más barato
      // es el que nunca se sube.
      const prepared = isImage
        ? await prepareImageForUpload(file)
        : { blob: file as Blob, ext: (file.name.split('.').pop() || 'mp4').toLowerCase(), contentType: file.type }
      // Nombre descriptivo (ver lib/media.ts): el nombre del producto viaja
      // en el archivo — señal para Google Images. Solo subidas nuevas.
      const filePath = mediaPath('products', name || 'producto', `f.${prepared.ext}`)

      // Add placeholder entry
      const entry: MediaEntry = {
        tempId,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
        alt: '',
        position: mediaEntries.length,
        is_primary: mediaEntries.length === 0,
        uploading: true,
        progress: 0,
        file,
      }

      setMediaEntries(prev => [...prev, entry])

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, prepared.blob, {
          cacheControl: STORAGE_CACHE_SECONDS,
          contentType: prepared.contentType,
          upsert: false,
        })

      if (uploadError) {
        setMediaEntries(prev => prev.filter(m => m.tempId !== tempId))
        setError(`Error subiendo ${file.name}: ${uploadError.message}`)
        continue
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path)

      setMediaEntries(prev =>
        prev.map(m =>
          m.tempId === tempId
            ? { ...m, url: publicUrlData.publicUrl, uploading: false, progress: 100 }
            : m
        )
      )
    }
  }, [mediaEntries.length, name])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [uploadFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeMedia = (tempId: string) => {
    setMediaEntries(prev => {
      const filtered = prev.filter(m => m.tempId !== tempId)
      // If removed item was primary, make first one primary
      if (filtered.length > 0 && !filtered.some(m => m.is_primary)) {
        filtered[0].is_primary = true
      }
      return filtered
    })
  }

  const setPrimary = (tempId: string) => {
    setMediaEntries(prev =>
      prev.map(m => ({ ...m, is_primary: m.tempId === tempId }))
    )
  }

  // Media drag reorder
  const handleMediaDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleMediaDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    setMediaEntries(prev => {
      const items = [...prev]
      const [dragged] = items.splice(dragIndex, 1)
      items.splice(index, 0, dragged)
      return items.map((m, i) => ({ ...m, position: i }))
    })
    setDragIndex(index)
  }

  const handleMediaDragEnd = () => {
    setDragIndex(null)
  }

  // ---- Sizes ----
  const addSize = () => {
    setSizes(prev => [
      ...prev,
      {
        tempId: `size_${Date.now()}`,
        size: '',
        price_uyu: '',
        available: true,
        sort_order: prev.length,
      },
    ])
  }

  const updateSize = (tempId: string, field: keyof SizeEntry, value: string | boolean | number) => {
    setSizes(prev => prev.map(s => s.tempId === tempId ? { ...s, [field]: value } : s))
  }

  const removeSize = (tempId: string) => {
    setSizes(prev => prev.filter(s => s.tempId !== tempId))
  }

  // ---- Color toggle ----
  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    )
  }

  // ---- Save ----
  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!slug.trim()) {
      setError('El slug es requerido')
      return
    }
    if (!isCustomOnly && !basePriceUyu && sizes.every((s) => !s.price_uyu)) {
      setError('Ingresá un precio base o un precio en al menos un talle.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const supabase = createClient()

      // Create product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          collection_id: collectionId || null,
          badge: badge.trim() || null,
          status,
          base_price_uyu: basePriceUyu ? parseInt(basePriceUyu) : null,
          discount_percent: Math.max(0, Math.min(90, parseInt(discountPercent) || 0)),
          discount_active: discountActive,
          lead_time_weeks_min: parseInt(leadTimeMin) || 2,
          lead_time_weeks_max: parseInt(leadTimeMax) || 3,
          material: material.trim() || null,
          care_instructions: careInstructions.trim() || null,
          is_custom_only: isCustomOnly,
          sort_order: 0,
        })
        .select()
        .single()

      if (productError) throw productError

      // Insert media — fail loudly if it doesn't work, otherwise the owner
      // thinks photos are saved and the product page renders blank.
      if (mediaEntries.length > 0) {
        const stillUploading = mediaEntries.filter(m => m.uploading)
        if (stillUploading.length > 0) {
          throw new Error(`Esperá a que terminen de subirse ${stillUploading.length} foto(s).`)
        }

        const mediaInserts = mediaEntries
          .filter((m) => !m.uploading && m.url && !m.url.startsWith('blob:'))
          .map((m, i) => ({
            product_id: product.id,
            url: m.url,
            type: m.type,
            alt: m.alt || null,
            position: i,
            is_primary: m.is_primary,
          }))

        if (mediaInserts.length > 0) {
          const { error: mediaError } = await supabase.from('product_media').insert(mediaInserts)
          if (mediaError) {
            throw new Error(`No se guardaron las fotos: ${mediaError.message}. Revisá que el bucket "media" exista en Supabase Storage.`)
          }
        }
      }

      // Insert sizes
      if (sizes.length > 0) {
        const sizeInserts = sizes
          .filter(s => s.size.trim())
          .map((s, i) => ({
            product_id: product.id,
            size: s.size.trim(),
            price_uyu: s.price_uyu ? parseInt(s.price_uyu) : null,
            available: s.available,
            sort_order: i,
          }))

        if (sizeInserts.length > 0) {
          const { error: sizeError } = await supabase.from('product_sizes').insert(sizeInserts)
          if (sizeError) throw new Error(`No se guardaron los talles: ${sizeError.message}`)
        }
      }

      // Insert colors
      if (selectedColors.length > 0) {
        const colorInserts = selectedColors.map((colorId) => ({
          product_id: product.id,
          color_id: colorId,
        }))
        const { error: colorError } = await supabase.from('product_colors').insert(colorInserts)
        if (colorError) throw new Error(`No se guardaron los colores: ${colorError.message}`)
      }

      setToast('Producto creado exitosamente')
      setTimeout(() => {
        router.push('/admin/productos')
      }, 1000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear el producto'
      setError(message)
      setSaving(false)
    }
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Nuevo producto</h2>
          <p>Completá los datos del producto.</p>
        </div>
        <div className="admin-actions admin-actions-desktop">
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => router.push('/admin/productos')}
          >
            Cancelar
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <div className="admin-form-split" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left column — main fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Basic info */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Información básica</h3>
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Top Margarita"
                />
              </div>
              <div className="admin-field">
                <label>Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManual(true) }}
                  placeholder="top-margarita"
                />
                <span className="field-hint">Se genera automáticamente del nombre</span>
              </div>
              <div className="admin-field full-width">
                <label>Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describí el producto..."
                />
                {/* Borrador honesto (lib/description-draft.ts): solo datos
                    reales del producto, nunca materiales ni medidas inventadas.
                    Solo con el campo vacío — no pisa texto escrito. */}
                {!description.trim() && name.trim() !== '' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-secondary admin-btn-sm"
                    style={{ alignSelf: 'flex-start', marginTop: 6 }}
                    onClick={() => setDescription(draftDescription({
                      name,
                      categorySlug: categories.find((c) => c.id === categoryId)?.slug ?? null,
                      hasSizes: sizes.length > 0,
                      hasColors: selectedColors.length > 0,
                      isCustomOnly,
                    }))}
                  >
                    ✨ Generar borrador para editar
                  </button>
                )}
                <span className="field-hint">
                  La receta que vende: qué lana es, medidas reales, cómo calza, horas de tejido y con qué combina.
                  Sin este texto la ficha no convence, no aparece en Google y no la citan las IA.
                </span>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Fotos y videos</h3>

            <div
              className={`admin-dropzone ${dragOver ? 'dragover' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <p>Arrastrá varias fotos aquí o hacé clic para elegirlas</p>
              <div className="dropzone-hint">Podés subir varias a la vez · Arrastralas para ordenarlas · La primera es la principal</div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && uploadFiles(e.target.files)}
            />

            {mediaEntries.length > 0 && (
              <div className="admin-media-grid">
                {mediaEntries.map((media, index) => (
                  <div
                    key={media.tempId}
                    className={`admin-media-item ${media.is_primary ? 'primary' : ''} ${dragIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleMediaDragStart(index)}
                    onDragOver={(e) => handleMediaDragOver(e, index)}
                    onDragEnd={handleMediaDragEnd}
                  >
                    {media.is_primary && <span className="primary-badge">Principal</span>}

                    {media.type === 'video' ? (
                      <>
                        <video src={media.url} muted />
                        <div className="video-icon">
                          <svg fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={media.url} alt={media.alt || 'Product media'} />
                    )}

                    {media.uploading && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0.25rem' }}>
                        <div className="upload-progress-bar">
                          <div className="upload-progress-bar-fill" style={{ width: '60%' }} />
                        </div>
                      </div>
                    )}

                    <div className="media-overlay">
                      {!media.is_primary && (
                        <button onClick={() => setPrimary(media.tempId)}>★ Principal</button>
                      )}
                      <button className="danger" onClick={() => removeMedia(media.tempId)}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes */}
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>Talles</h3>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addSize}>
                + Agregar talla
              </button>
            </div>

            {sizes.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.85rem' }}>
                Sin tallas definidas. El producto usará el precio base.
              </p>
            ) : (
              <div className="admin-sizes-list">
                {sizes.map((s) => (
                  <div key={s.tempId} className="admin-size-row">
                    <input
                      type="text"
                      placeholder="Talla (ej: S)"
                      value={s.size}
                      onChange={(e) => updateSize(s.tempId, 'size', e.target.value)}
                      style={{ width: 80 }}
                    />
                    <input
                      type="number"
                      placeholder="Precio (opcional)"
                      value={s.price_uyu}
                      onChange={(e) => updateSize(s.tempId, 'price_uyu', e.target.value)}
                      style={{ width: 130 }}
                    />
                    <label className="size-available">
                      <input
                        type="checkbox"
                        checked={s.available}
                        onChange={(e) => updateSize(s.tempId, 'available', e.target.checked)}
                      />
                      Disponible
                    </label>
                    <button className="admin-btn-icon danger" onClick={() => removeSize(s.tempId)}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Status */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Estado</h3>
            <div className="admin-toggle-group">
              {(['draft', 'active', 'soldout'] as const).map((s) => (
                <button
                  key={s}
                  className={`admin-toggle-option ${status === s ? 'selected' : ''}`}
                  onClick={() => setStatus(s)}
                >
                  {s === 'draft' && 'Borrador'}
                  {s === 'active' && 'Activo'}
                  {s === 'soldout' && 'Agotado'}
                </button>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Precio</h3>
            <div className="admin-field">
              <label>Precio base (UYU)</label>
              <input
                type="number"
                value={basePriceUyu}
                onChange={(e) => setBasePriceUyu(e.target.value)}
                placeholder="2500"
              />
            </div>
            <div className="admin-field" style={{ marginTop: '1rem' }}>
              <label>Descuento (%)</label>
              <input
                type="number"
                min={0}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.6rem', fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={discountActive}
                  onChange={(e) => setDiscountActive(e.target.checked)}
                />
                Descuento activo
              </label>
              <span className="field-hint">Mostrará el precio tachado y un porcentaje en la tienda.</span>
            </div>
          </div>

          {/* Category */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Categoría</h3>
            <div className="admin-field">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {collections.length > 0 && (
              <div className="admin-field" style={{ marginTop: 12 }}>
                <label>Colección</label>
                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                  <option value="">Sin colección</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Badge */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Badge</h3>
            <div className="admin-field">
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ej: Nuevo, Bestseller"
              />
              <span className="field-hint">Etiqueta que aparece sobre la imagen del producto</span>
            </div>
          </div>

          {/* Colors */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Colores disponibles</h3>
            {colors.length === 0 ? (
              <p style={{ color: '#999', fontSize: '0.85rem' }}>No hay colores definidos aún.</p>
            ) : (
              <div className="admin-color-list">
                {colors.map(color => (
                  <button
                    key={color.id}
                    className={`admin-color-chip ${selectedColors.includes(color.id) ? 'selected' : ''}`}
                    onClick={() => toggleColor(color.id)}
                  >
                    <span className="chip-swatch" style={{ backgroundColor: color.hex }} />
                    {color.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Lead time / Material */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 500 }}>Detalles</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Tiempo mín (sem.)</label>
                  <input
                    type="number"
                    value={leadTimeMin}
                    onChange={(e) => setLeadTimeMin(e.target.value)}
                  />
                </div>
                <div className="admin-field" style={{ flex: 1 }}>
                  <label>Tiempo máx (sem.)</label>
                  <input
                    type="number"
                    value={leadTimeMax}
                    onChange={(e) => setLeadTimeMax(e.target.value)}
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Material</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Ej: Algodón 100%"
                />
              </div>
              <div className="admin-field">
                <label>Instrucciones de cuidado</label>
                <textarea
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="Ej: Lavar a mano con agua fría"
                  style={{ minHeight: 60 }}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#555', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isCustomOnly}
                  onChange={(e) => setIsCustomOnly(e.target.checked)}
                />
                Solo a pedido (encargo)
              </label>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className="admin-toast success">{toast}</div>
      )}

      {/* Sticky save bar — mobile-only */}
      <div className="admin-mobile-save-bar">
        <button
          className="admin-btn admin-btn-secondary"
          onClick={() => router.push('/admin/productos')}
        >
          Cancelar
        </button>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </>
  )
}
