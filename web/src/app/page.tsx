'use client'

import { useState } from 'react'

type Materia = { nombre: string; nota: number }
type MateriaEdit = { nombre: string; nota: string }
type Analisis = {
  promedio_calculado: number
  materias_analizadas: number
  fortalezas: Materia[]
  areas_por_reforzar: Materia[]
  areas_detectadas: string[]
  nota_metodologica: string
}
type ParsedData = { archivo_analizado: string; promedio_general: number | null; materias: Materia[] }
type Preview = {
  status: string
  parsedData: ParsedData
  analisis: Analisis
  advertencias: string[]
}
type Recomendacion = { carrera: string; compatibilidad: number }
type ResultadoVocacional = {
  perfil_dominante: string
  perfiles: Record<string, number>
  recomendaciones: Recomendacion[]
}
type Evaluacion = {
  status: string
  pipeline: string
  parsedData: ParsedData
  analisis: Analisis
  advertencias: string[]
  scalaMetrics: unknown
  resultadoVocacional: ResultadoVocacional
}

const PERFILES: Record<string, string> = {
  tecnologico: 'Tecnológico',
  cientifico: 'Científico',
  numerico: 'Numérico',
  humanistico: 'Humanístico',
  social_comunicativo: 'Social-Comunicativo',
}
const CARRERAS: Record<string, string> = {
  ingenieria_sistemas: 'Ingeniería de Sistemas',
  ingenieria_software: 'Ingeniería de Software',
  ciencia_datos: 'Ciencia de Datos',
  ingenieria_electronica: 'Ingeniería Electrónica',
  ingenieria_industrial: 'Ingeniería Industrial',
  ingenieria_civil: 'Ingeniería Civil',
  ingenieria_mecanica: 'Ingeniería Mecánica',
  arquitectura: 'Arquitectura',
  medicina: 'Medicina',
  enfermeria: 'Enfermería',
  biologia: 'Biología',
  psicologia: 'Psicología',
  derecho: 'Derecho',
  comunicacion: 'Comunicación',
  administracion: 'Administración',
  economia: 'Economía',
  contabilidad: 'Contabilidad',
  marketing: 'Marketing',
  educacion: 'Educación',
}
const ORDEN_PERFILES = ['tecnologico', 'cientifico', 'numerico', 'humanistico', 'social_comunicativo']

function nombreCarrera(carrera: string) {
  return CARRERAS[carrera] || carrera.replaceAll('_', ' ')
}
function porcentaje(numero: number) {
  return `${Math.max(0, Math.min(100, numero))}%`
}
function EtiquetasMaterias({ materias, vacio }: { materias: Materia[]; vacio: string }) {
  if (!materias.length) return <p className="text-xs text-slate-400">{vacio}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {materias.map((m, i) => (
        <span key={`${m.nombre}-${i}`} className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-200">
          {m.nombre} <strong className="text-cyan-300">{m.nota.toFixed(2)}/20</strong>
        </span>
      ))}
    </div>
  )
}

export default function Home() {
  const [archivo, setArchivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [materias, setMaterias] = useState<MateriaEdit[]>([])
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null)
  const [cargando, setCargando] = useState<'extraer' | 'evaluar' | null>(null)
  const [error, setError] = useState<string | null>(null)

  function limpiarResultado() {
    setPreview(null)
    setEvaluacion(null)
    setMaterias([])
    setError(null)
  }
  function cambiarMateria(indice: number, campo: 'nombre' | 'nota', valor: string) {
    setMaterias(actual => actual.map((m, i) => i === indice ? { ...m, [campo]: valor } : m))
    setEvaluacion(null)
  }
  const materiasValidas = materias.length >= 3 && materias.every(m => {
    if (!m.nombre.trim() || m.nombre.length > 100 || m.nota.trim() === '') return false
    const n = Number(m.nota.replace(',', '.'))
    return Number.isFinite(n) && n >= 0 && n <= 20
  })

  async function extraer(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!archivo) return
    if (!archivo.name.toLowerCase().endsWith('.pdf') || archivo.size > 10 * 1024 * 1024) {
      setError('Selecciona un PDF de máximo 10 MB.')
      return
    }
    setCargando('extraer')
    limpiarResultado()
    try {
      const form = new FormData()
      form.append('file', archivo)
      const respuesta = await fetch('/api/extraer', { method: 'POST', body: form })
      const json = await respuesta.json()
      if (!respuesta.ok) throw new Error(json.error || 'No se pudo extraer el certificado.')
      const datos = json as Preview
      setPreview(datos)
      setMaterias(datos.parsedData.materias.map(m => ({ nombre: m.nombre, nota: String(m.nota) })))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo extraer el PDF.')
    } finally {
      setCargando(null)
    }
  }
  async function evaluar() {
    if (!preview || !materiasValidas) return
    setCargando('evaluar')
    setError(null)
    setEvaluacion(null)
    try {
      const respuesta = await fetch('/api/evaluar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivo_analizado: preview.parsedData.archivo_analizado,
          materias: materias.map(m => ({ nombre: m.nombre.trim(), nota: Number(m.nota.replace(',', '.')) })),
        }),
      })
      const json = await respuesta.json()
      if (!respuesta.ok) throw new Error(json.error || 'El motor de recomendaciones no pudo evaluar los datos.')
      setEvaluacion(json as Evaluacion)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falló la evaluación.')
    } finally {
      setCargando(null)
    }
  }

  const analisis = evaluacion?.analisis || preview?.analisis
  const motor = evaluacion?.resultadoVocacional
  const perfil = motor?.perfil_dominante || ''

  return (
    <main className="min-h-screen bg-[#090A0F] px-4 py-10 font-mono text-slate-200">
      <div className="mx-auto max-w-5xl space-y-6 rounded-2xl border border-purple-500/30 bg-[#12151E] p-5 shadow-[0_0_40px_rgba(168,85,247,0.13)] md:p-8">
        <header>
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-purple-400">SYS.MULTI // V2.0</p>
          <h1 className="text-2xl font-bold text-white md:text-3xl">EVALUADOR VOCACIONAL</h1>
          <p className="mt-2 text-xs text-slate-400">PYTHON ➔ REVISIÓN DE NOTAS ➔ SCALA ➔ PROLOG</p>
        </header>

        <section className="space-y-4 rounded-xl border border-purple-500/30 bg-purple-950/10 p-5">
          <h2 className="font-bold text-white">1. Carga tu certificado</h2>
          <p className="text-xs text-slate-400">Solo PDF con texto seleccionable, hasta 10 MB. Los PDF escaneados requieren OCR, que aún no está disponible.</p>
          <form onSubmit={extraer} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              aria-label="Seleccionar certificado PDF"
              type="file"
              accept=".pdf,application/pdf"
              className="block w-full min-w-0 text-xs file:mr-3 file:rounded-lg file:border file:border-purple-500/50 file:bg-purple-950 file:px-3 file:py-2 file:text-purple-200"
              onChange={e => {
                setArchivo(e.target.files?.[0] ?? null)
                limpiarResultado()
              }}
            />
            <button disabled={!archivo || cargando !== null} className="rounded-lg bg-purple-600 px-5 py-3 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-50">
              {cargando === 'extraer' ? 'EXTRAYENDO...' : 'EXTRAER NOTAS'}
            </button>
          </form>
        </section>

        {error && <div role="alert" className="rounded-xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-300">{error}</div>}

        {preview && (
          <section className="space-y-4 rounded-xl border border-cyan-500/30 bg-[#0C1018] p-5">
            <div>
              <h2 className="text-lg font-bold text-white">2. Revisa las materias extraídas</h2>
              <p className="mt-2 text-xs text-slate-400">
                Corrige cualquier materia o nota antes de calcular las carreras. Las notas deben estar entre 0 y 20.
              </p>
              <p className="mt-1 text-xs text-cyan-400">Documento: {preview.parsedData.archivo_analizado}</p>
            </div>
            {preview.advertencias?.map((aviso, i) => (
              <p key={i} className="rounded-lg border border-amber-600/30 bg-amber-950/20 p-3 text-xs text-amber-200">Aviso: {aviso}</p>
            ))}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-slate-800 text-slate-200">
                  <tr><th className="p-3">Materia</th><th className="p-3">Nota / 20</th><th className="p-3">Acción</th></tr>
                </thead>
                <tbody>
                  {materias.map((m, indice) => (
                    <tr key={indice} className="border-b border-slate-800">
                      <td className="p-2">
                        <input aria-label={`Materia ${indice + 1}`} value={m.nombre} onChange={e => cambiarMateria(indice, 'nombre', e.target.value)} maxLength={100} className="w-full rounded-md border border-slate-700 bg-slate-900 p-2 text-white" />
                      </td>
                      <td className="p-2">
                        <input aria-label={`Nota ${indice + 1}`} value={m.nota} onChange={e => cambiarMateria(indice, 'nota', e.target.value)} inputMode="decimal" className="w-28 rounded-md border border-slate-700 bg-slate-900 p-2 text-white" />
                      </td>
                      <td className="p-2">
                        <button type="button" onClick={() => { setMaterias(actual => actual.filter((_, i) => i !== indice)); setEvaluacion(null) }} className="rounded-md border border-red-500/30 px-3 py-2 text-red-300 hover:bg-red-950/30">Quitar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => { setMaterias(actual => [...actual, { nombre: '', nota: '' }]); setEvaluacion(null) }} disabled={materias.length >= 150} className="rounded-lg border border-slate-600 px-4 py-2 text-xs hover:bg-slate-800 disabled:opacity-40">+ Añadir materia</button>
            {!materiasValidas && <p className="text-xs text-amber-300">Completa al menos 3 materias con nombres y notas válidos (0 a 20).</p>}
            <button onClick={evaluar} disabled={!materiasValidas || cargando !== null} className="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-cyan-700 px-5 py-3 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50">
              {cargando === 'evaluar' ? 'CALCULANDO PERFILES Y CARRERAS...' : '3. CONFIRMAR NOTAS Y EVALUAR'}
            </button>
          </section>
        )}

        {analisis && (
          <section className="space-y-4 rounded-xl border border-slate-700 bg-[#0C0F16] p-5">
            <h2 className="text-lg font-bold text-white">Análisis académico de Python</h2>
            <p className="text-xs text-slate-400">
              {evaluacion ? 'Análisis actualizado con las notas confirmadas.' : 'Vista inicial: se actualizará después de confirmar las notas.'}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-900 p-4"><p className="text-xs text-slate-400">Promedio simple</p><p className="mt-1 text-2xl font-bold text-cyan-300">{analisis.promedio_calculado.toFixed(2)}</p></div>
              <div className="rounded-lg bg-slate-900 p-4"><p className="text-xs text-slate-400">Materias</p><p className="mt-1 text-2xl font-bold text-white">{analisis.materias_analizadas}</p></div>
              <div className="rounded-lg bg-slate-900 p-4"><p className="text-xs text-slate-400">Áreas detectadas</p><p className="mt-1 text-2xl font-bold text-white">{analisis.areas_detectadas.length}/6</p></div>
            </div>
            <div><h3 className="mb-2 text-sm font-semibold text-emerald-300">Fortalezas (≥ 16)</h3><EtiquetasMaterias materias={analisis.fortalezas} vacio="Ninguna materia supera el umbral de fortaleza establecido." /></div>
            <div><h3 className="mb-2 text-sm font-semibold text-amber-300">Áreas por reforzar (≤ 12)</h3><EtiquetasMaterias materias={analisis.areas_por_reforzar} vacio="No se detectaron materias por debajo del umbral establecido." /></div>
            <p className="text-xs text-slate-500">{analisis.nota_metodologica}</p>
          </section>
        )}

        {motor && (
          <div className="space-y-5">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 text-xs text-emerald-300">Evaluación completada: Python, Scala y Prolog.</div>
            {(evaluacion?.advertencias ?? []).map((aviso, i) => <p key={i} className="rounded-lg border border-amber-600/30 p-3 text-xs text-amber-200">Aviso: {aviso}</p>)}
            <section className="rounded-xl border border-purple-500/30 bg-purple-950/10 p-5">
              <h2 className="text-sm text-purple-300">Perfil académico predominante</h2>
              <div className="mt-3 flex items-center justify-between gap-3">
                <h3 className="text-2xl font-bold text-white">{PERFILES[perfil] || perfil}</h3>
                <p className="text-2xl font-bold text-cyan-300">{(motor.perfiles[perfil] ?? 0).toFixed(1)}%</p>
              </div>
            </section>
            <section className="rounded-xl border border-slate-700 p-5">
              <h2 className="mb-4 text-lg font-bold text-white">Perfiles académicos — Scala</h2>
              <div className="space-y-4">
                {ORDEN_PERFILES.map(nombre => (
                  <div key={nombre}>
                    <div className="mb-2 flex justify-between text-xs"><span>{PERFILES[nombre]}</span><span className="text-cyan-300">{(motor.perfiles[nombre] ?? 0).toFixed(2)}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: porcentaje(motor.perfiles[nombre] ?? 0) }} /></div>
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-slate-700 p-5">
              <h2 className="mb-4 text-lg font-bold text-white">Top 5 de carreras — Prolog</h2>
              <div className="space-y-3">
                {motor.recomendaciones.map((r, indice) => (
                  <div key={`${r.carrera}-${indice}`} className="rounded-xl border border-slate-800 bg-[#090B11] p-4">
                    <div className="mb-2 flex justify-between gap-3 text-sm"><strong>{indice + 1}. {nombreCarrera(r.carrera)}</strong><strong className="text-cyan-300">{r.compatibilidad.toFixed(2)}%</strong></div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" style={{ width: porcentaje(r.compatibilidad) }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-amber-200/80">Estos puntajes reflejan reglas académicas del prototipo, no probabilidades de éxito profesional ni un diagnóstico psicológico.</p>
            </section>
            <details className="rounded-xl border border-slate-800 p-4">
              <summary className="cursor-pointer text-xs text-slate-400">VER DATOS TÉCNICOS</summary>
              <pre className="mt-3 max-h-80 overflow-auto text-[11px] text-cyan-300">{JSON.stringify(evaluacion, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </main>
  )
}
