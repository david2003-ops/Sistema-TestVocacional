"use client"
import { useState } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/evaluar', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('ERR_PIPELINE_FAILURE: No se pudo procesar el flujo')
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#090A0F] text-[#E2E8F0] p-6 flex flex-col items-center justify-center font-mono selection:bg-purple-500 selection:text-white">
      {/* Contenedor principal con marco retro */}
      <div className="w-full max-w-2xl bg-[#12151E]/90 border border-purple-500/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] backdrop-blur-md relative overflow-hidden">
        
        {/* Adorno lumínico de fondo (nebulosa) */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
            <span className="text-xs tracking-widest text-purple-400 uppercase">SYS.MULTI // v1.0</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-1 drop-shadow-[0_2px_10px_rgba(168,85,247,0.4)]">
            EVALUADOR VOCACIONAL
          </h1>
          <p className="text-xs text-slate-400 mb-6">
            INICIO DE PIPELINE: [PY] ➔ [SCALA] ➔ [PROLOG]
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="p-4 rounded-xl border border-dashed border-purple-500/40 bg-purple-950/10 hover:border-purple-400/70 transition-all text-center">
              <label className="block text-xs uppercase tracking-wider text-purple-300 mb-3">
                // SELECCIONAR CERTIFICADO (PDF)
              </label>
              
              <label className="relative inline-block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
                <span className="py-2.5 px-6 rounded-lg border border-purple-500/50 text-xs font-bold bg-purple-950 text-purple-200 hover:bg-purple-900/80 hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all inline-block">
                  {file ? file.name : 'SELECCIONAR ARCHIVO'}
                </span>
              </label>
              
              {file && (
                <p className="text-[10px] text-cyan-400 mt-2 font-mono">
                  ARCHIVO CARGADO: {file.name}
                </p>
              )}
            </div>

            {/* Botón con nebulosa difuminada */}
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
                    EJECUTANDO PIPELINE...
                  </>
                ) : (
                  'INICIAR DIAGNÓSTICO'
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-950/30 text-red-400 rounded-xl text-xs border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              &gt; ERROR: {error}
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-[#090A0F]/80 rounded-xl border border-purple-500/30 shadow-inner">
              <div className="text-[10px] text-purple-400 uppercase tracking-widest mb-2 flex justify-between">
                <span>// OUTPUT_TELEMETRY</span>
                <span>STATUS: 200_OK</span>
              </div>
              <pre className="text-xs text-cyan-300 font-mono overflow-auto max-h-72 p-2">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

