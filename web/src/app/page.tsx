"use client"

import { useState } from "react"

type Recomendacion = {
  carrera: string
  compatibilidad: number
}

type ResultadoVocacional = {
  perfil_dominante: string
  perfiles: Record<string, number>
  recomendaciones: Recomendacion[]
}

type PipelineResult = {
  status: string
  pipeline: string
  parsedData?: any
  scalaMetrics?: any
  resultadoVocacional?: ResultadoVocacional
}

const PERFIL_LABELS: Record<string, string> = {
  tecnologico: "Tecnológico",
  cientifico: "Científico",
  numerico: "Numérico",
  humanistico: "Humanístico",
  social_comunicativo: "Social-Comunicativo",
}

const CARRERA_LABELS: Record<string, string> = {
  ingenieria_sistemas: "Ingeniería de Sistemas",
  ingenieria_software: "Ingeniería de Software",
  ciencia_datos: "Ciencia de Datos",
  ingenieria_electronica: "Ingeniería Electrónica",
  ingenieria_industrial: "Ingeniería Industrial",
  ingenieria_civil: "Ingeniería Civil",
  ingenieria_mecanica: "Ingeniería Mecánica",
  arquitectura: "Arquitectura",
  medicina: "Medicina",
  enfermeria: "Enfermería",
  biologia: "Biología",
  psicologia: "Psicología",
  derecho: "Derecho",
  comunicacion: "Comunicación",
  administracion: "Administración",
  economia: "Economía",
  contabilidad: "Contabilidad",
  marketing: "Marketing",
  educacion: "Educación",
}

const ORDEN_PERFILES = [
  "tecnologico",
  "cientifico",
  "numerico",
  "humanistico",
  "social_comunicativo",
]

function nombrePerfil(perfil: string) {
  return PERFIL_LABELS[perfil] || perfil
}

function nombreCarrera(carrera: string) {
  if (CARRERA_LABELS[carrera]) {
    return CARRERA_LABELS[carrera]
  }

  return carrera
    .split("_")
    .map(
      (palabra) =>
        palabra.charAt(0).toUpperCase() + palabra.slice(1)
    )
    .join(" ")
}

function limitarPorcentaje(valor: number) {
  return Math.min(100, Math.max(0, valor))
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/evaluar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "ERR_PIPELINE_FAILURE: No se pudo procesar el flujo"
        )
      }

      setResult(data)
    } catch (err: any) {
      setError(
        err?.message ||
          "Se produjo un error durante el diagnóstico"
      )
    } finally {
      setLoading(false)
    }
  }

  const resultado = result?.resultadoVocacional

  const perfilDominante =
    resultado?.perfil_dominante || ""

  const puntuacionDominante =
    resultado?.perfiles?.[perfilDominante] ?? 0

  return (
    <main className="min-h-screen bg-[#090A0F] text-[#E2E8F0] px-4 py-10 font-mono selection:bg-purple-500 selection:text-white">
      <div className="w-full max-w-5xl mx-auto bg-[#12151E]/90 border border-purple-500/30 p-6 md:p-8 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md relative overflow-hidden">

        {/* Nebulosas */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">

          {/* CABECERA */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />

            <span className="text-xs tracking-widest text-purple-400 uppercase">
              SYS.MULTI // V1.0
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1 drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
            EVALUADOR VOCACIONAL
          </h1>

          <p className="text-xs text-slate-400 mb-7">
            PIPELINE: [PY] ➔ [SCALA] ➔ [PROLOG]
          </p>

          {/* FORMULARIO */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="p-5 rounded-xl border border-dashed border-purple-500/40 bg-purple-950/10 hover:border-purple-400/70 transition-all text-center">

              <label className="block text-xs uppercase tracking-wider text-purple-300 mb-3">
                // SELECCIONAR CERTIFICADO ACADÉMICO (PDF)
              </label>

              <label className="relative inline-block cursor-pointer">

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    setFile(
                      e.target.files?.[0] || null
                    )
                    setResult(null)
                    setError(null)
                  }}
                  className="hidden"
                />

                <span className="py-2.5 px-6 rounded-lg border border-purple-500/50 text-xs font-bold bg-purple-950 text-purple-200 hover:bg-purple-900/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all inline-block">
                  {file
                    ? file.name
                    : "SELECCIONAR ARCHIVO"}
                </span>

              </label>

              {file && (
                <p className="text-[10px] text-cyan-400 mt-3">
                  ARCHIVO CARGADO: {file.name}
                </p>
              )}

            </div>

            {/* BOTÓN */}
            <div className="relative group">

              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300 pointer-events-none" />

              <button
                type="submit"
                disabled={!file || loading}
                className="relative w-full py-3 px-6 bg-[#0E1017] text-white rounded-xl font-bold text-xs tracking-widest uppercase border border-purple-500/40 disabled:opacity-40 disabled:pointer-events-none hover:bg-purple-950/40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ANALIZANDO CERTIFICADO...
                  </>
                ) : (
                  "INICIAR DIAGNÓSTICO"
                )}
              </button>

            </div>
          </form>

          {/* ERROR */}
          {error && (
            <div className="mt-5 p-4 bg-red-950/30 text-red-400 rounded-xl text-xs border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              &gt; ERROR: {error}
            </div>
          )}

          {/* RESULTADOS */}
          {resultado && (
            <div className="mt-8 space-y-6">

              {/* ESTADO */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-purple-500/20 pb-4">

                <div>
                  <p className="text-[10px] text-purple-400 tracking-widest uppercase">
                    // RESULTADO DEL ANÁLISIS
                  </p>

                  <h2 className="text-xl font-bold text-white mt-1">
                    DIAGNÓSTICO ACADÉMICO
                  </h2>
                </div>

                <span className="text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 rounded-full px-3 py-1">
                  ● PIPELINE COMPLETADO
                </span>

              </div>

              {/* PERFIL DOMINANTE */}
              <section className="relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/50 to-[#0C1018] p-6">

                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />

                <p className="text-[10px] text-purple-300 tracking-[0.2em] uppercase mb-3">
                  Perfil académico predominante
                </p>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

                  <div>
                    <h3 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                      {nombrePerfil(
                        perfilDominante
                      )}
                    </h3>

                    <p className="text-xs text-slate-400 mt-2 max-w-xl">
                      Este perfil se obtiene a partir del
                      rendimiento académico detectado en
                      las materias del certificado.
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-4xl font-black text-cyan-300">
                      {puntuacionDominante.toFixed(
                        1
                      )}
                    </span>

                    <span className="text-lg text-cyan-500">
                      %
                    </span>
                  </div>

                </div>

              </section>

              {/* PERFILES ACADÉMICOS */}
              <section className="rounded-2xl border border-slate-700/60 bg-[#0C0F16]/80 p-5 md:p-6">

                <div className="mb-5">
                  <p className="text-[10px] text-cyan-400 tracking-widest uppercase">
                    // MATRIZ DE FORTALEZAS
                  </p>

                  <h3 className="text-lg font-bold text-white mt-1">
                    Perfiles académicos
                  </h3>
                </div>

                <div className="space-y-5">

                  {ORDEN_PERFILES.map(
                    (perfil) => {
                      const valor =
                        resultado.perfiles?.[
                          perfil
                        ] ?? 0

                      return (
                        <div key={perfil}>

                          <div className="flex justify-between items-center mb-2">

                            <span className="text-xs text-slate-300">
                              {nombrePerfil(
                                perfil
                              )}
                            </span>

                            <span className="text-xs font-bold text-cyan-300">
                              {valor.toFixed(
                                1
                              )}
                              %
                            </span>

                          </div>

                          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">

                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.35)] transition-all duration-700"
                              style={{
                                width: `${limitarPorcentaje(
                                  valor
                                )}%`,
                              }}
                            />

                          </div>

                        </div>
                      )
                    }
                  )}

                </div>

              </section>

              {/* TOP CARRERAS */}
              <section className="rounded-2xl border border-purple-500/30 bg-[#0C0F16]/80 p-5 md:p-6">

                <div className="mb-5">

                  <p className="text-[10px] text-purple-400 tracking-widest uppercase">
                    // MOTOR EXPERTO PROLOG
                  </p>

                  <h3 className="text-lg font-bold text-white mt-1">
                    Carreras recomendadas
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Ordenadas según compatibilidad con
                    tu perfil académico.
                  </p>

                </div>

                <div className="space-y-3">

                  {resultado.recomendaciones.map(
                    (
                      recomendacion,
                      index
                    ) => (
                      <div
                        key={`${recomendacion.carrera}-${index}`}
                        className="group flex items-center gap-4 rounded-xl border border-slate-800 bg-[#090B11] p-4 hover:border-purple-500/50 hover:bg-purple-950/10 transition-all"
                      >

                        {/* POSICIÓN */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black">
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        {/* CARRERA */}
                        <div className="flex-1 min-w-0">

                          <h4 className="text-sm md:text-base font-bold text-white">
                            {nombreCarrera(
                              recomendacion.carrera
                            )}
                          </h4>

                          <div className="mt-2 h-1.5 bg-slate-900 rounded-full overflow-hidden">

                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full"
                              style={{
                                width: `${limitarPorcentaje(
                                  recomendacion.compatibilidad
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                        {/* PORCENTAJE */}
                        <div className="text-right flex-shrink-0">

                          <span className="text-lg md:text-xl font-black text-cyan-300">
                            {recomendacion.compatibilidad.toFixed(
                              2
                            )}
                          </span>

                          <span className="text-xs text-cyan-500">
                            %
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </section>

              {/* AVISO */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4">

                <p className="text-[10px] leading-relaxed text-amber-200/70">
                  ESTE RESULTADO CONSTITUYE UNA
                  ORIENTACIÓN BASADA EN RENDIMIENTO
                  ACADÉMICO. NO SUSTITUYE UNA
                  EVALUACIÓN VOCACIONAL PSICOLÓGICA
                  PROFESIONAL.
                </p>

              </div>

              {/* INFORMACIÓN TÉCNICA */}
              <details className="rounded-xl border border-slate-800 bg-[#080A0F]">

                <summary className="cursor-pointer p-4 text-[10px] uppercase tracking-widest text-slate-500 hover:text-purple-300 transition-colors">
                  // VER DATOS TÉCNICOS DEL PIPELINE
                </summary>

                <pre className="text-[11px] text-cyan-300 overflow-auto max-h-72 p-4 border-t border-slate-800">
                  {JSON.stringify(
                    result,
                    null,
                    2
                  )}
                </pre>

              </details>

            </div>
          )}

        </div>
      </div>
    </main>
  )
}