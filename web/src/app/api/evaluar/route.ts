import { NextResponse } from 'next/server'
import path from 'node:path'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { comandoPython, ejecutarProceso } from '@/lib/ejecutar-proceso'

export const runtime = 'nodejs'

// Los procesos Scala y Prolog originales usan rutas fijas. En el modo local
// demostrativo, serializamos las evaluaciones para evitar mezclar resultados.
// Para producción/múltiples instancias se requiere una cola o trabajos aislados.
let cola: Promise<unknown> = Promise.resolve()
function exclusivo<T>(tarea: () => Promise<T>): Promise<T> {
  const siguiente = cola.then(tarea, tarea)
  cola = siguiente.then(() => undefined, () => undefined)
  return siguiente
}

async function evaluarConPipeline(contenido: unknown) {
  const base = path.resolve(process.cwd(), '..')
  const carpetaEntrada = path.join(base, 'data', 'entrada')
  const carpetaSalida = path.join(base, 'data', 'salida')
  const rutaParsed = path.join(carpetaEntrada, 'parsed_notas.json')
  const rutaScala = path.join(carpetaEntrada, 'scala_metrics.json')
  const rutaProlog = path.join(carpetaSalida, 'resultado_vocacional.json')

  // Primero Python valida las notas confirmadas y vuelve a calcular el análisis.
  let pythonResultado: {
    parsedData: { archivo_analizado: string; materias: { nombre: string; nota: number }[]; promedio_general: number }
    analisis: unknown
    advertencias: string[]
  }
  try {
    const texto = await ejecutarProceso(comandoPython(), [
      path.join(base, 'python', 'procesar_notas.py'),
    ], { cwd: base, stdin: JSON.stringify(contenido), timeoutMs: 10_000 })
    pythonResultado = JSON.parse(texto)
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Las notas no son válidas.'
    throw Object.assign(new Error(mensaje), { esValidacion: true })
  }

  await mkdir(carpetaEntrada, { recursive: true })
  await mkdir(carpetaSalida, { recursive: true })
  // Evitar presentar el JSON viejo si un proceso falla.
  await Promise.all([rm(rutaScala, { force: true }), rm(rutaProlog, { force: true })])
  await writeFile(rutaParsed, JSON.stringify(pythonResultado.parsedData, null, 2), 'utf8')

  const scalaDir = path.join(base, 'scala')
  if (process.platform === 'win32') {
    await ejecutarProceso('cmd.exe', ['/d', '/s', '/c', 'sbt', 'run'], {
      cwd: scalaDir, timeoutMs: 180_000,
    })
  } else {
    await ejecutarProceso('sbt', ['run'], { cwd: scalaDir, timeoutMs: 180_000 })
  }
  await ejecutarProceso('swipl', [
    '-q', '-s', 'recomendador.pl', '-g', 'guardar_resultado,halt',
  ], { cwd: path.join(base, 'prolog'), timeoutMs: 30_000 })

  const [scalaMetrics, resultadoVocacional] = await Promise.all([
    readFile(rutaScala, 'utf8').then(JSON.parse),
    readFile(rutaProlog, 'utf8').then(JSON.parse),
  ])
  return {
    status: 'success',
    pipeline: '[PY] ➔ [SCALA] ➔ [PROLOG] completados',
    parsedData: pythonResultado.parsedData,
    analisis: pythonResultado.analisis,
    advertencias: pythonResultado.advertencias,
    scalaMetrics,
    resultadoVocacional,
  }
}

export async function POST(request: Request) {
  try {
    const texto = await request.text()
    if (texto.length > 40_000) {
      return NextResponse.json({ error: 'La evaluación supera el tamaño permitido.' }, { status: 413 })
    }
    let payload: unknown
    try {
      payload = JSON.parse(texto)
    } catch {
      return NextResponse.json({ error: 'Los datos enviados no son JSON válido.' }, { status: 400 })
    }
    const resultado = await exclusivo(() => evaluarConPipeline(payload))
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Error del pipeline:', error)
    const mensaje = error instanceof Error ? error.message : 'Falló la evaluación.'
    const esValidacion = Boolean(error && typeof error === 'object' && 'esValidacion' in error)
    return NextResponse.json({ status: 'error', error: mensaje }, { status: esValidacion ? 400 : 500 })
  }
}
