import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { exec } from 'child_process'
import util from 'util'
import fsSync from 'fs'

const execPromise = util.promisify(exec)

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se adjuntó ningún archivo' },
        { status: 400 }
      )
    }

    // =====================================================
    // RUTAS PRINCIPALES
    // =====================================================

    const baseDir = path.join(process.cwd(), '..')

    const uploadDir = path.join(
      baseDir,
      'data',
      'entrada'
    )

    const outputDir = path.join(
      baseDir,
      'data',
      'salida'
    )

    await mkdir(uploadDir, { recursive: true })
    await mkdir(outputDir, { recursive: true })

    // =====================================================
    // GUARDAR PDF
    // =====================================================

    const filePath = path.join(
      uploadDir,
      file.name
    )

    const buffer = Buffer.from(
      await file.arrayBuffer()
    )

    await writeFile(
      filePath,
      buffer
    )

    // =====================================================
    // 1. PYTHON
    // PDF -> parsed_notas.json
    // =====================================================

    const pythonScriptPath = path.join(
      baseDir,
      'python',
      'parser.py'
    )

    await execPromise(
      `python "${pythonScriptPath}" --file "${file.name}"`
    )

    // =====================================================
    // 2. SCALA
    // parsed_notas.json -> scala_metrics.json
    // =====================================================

    const scalaDir = path.join(
      baseDir,
      'scala'
    )

    if (!fsSync.existsSync(scalaDir)) {
      throw new Error(
        'No se encontró la carpeta Scala'
      )
    }

    await execPromise(
      `sbt "run"`,
      {
        cwd: scalaDir
      }
    )

    // =====================================================
    // 3. PROLOG
    // scala_metrics.json -> resultado_vocacional.json
    // =====================================================

    const prologDir = path.join(
      baseDir,
      'prolog'
    )

    const recomendadorPath = path.join(
      prologDir,
      'recomendador.pl'
    )

    if (!fsSync.existsSync(recomendadorPath)) {
      throw new Error(
        'No se encontró prolog/recomendador.pl'
      )
    }

    await execPromise(
      `swipl -q -s "recomendador.pl" -g "guardar_resultado,halt"`,
      {
        cwd: prologDir
      }
    )

    // =====================================================
    // 4. LEER RESULTADOS
    // =====================================================

    const parsedJsonPath = path.join(
      uploadDir,
      'parsed_notas.json'
    )

    const scalaMetricsPath = path.join(
      uploadDir,
      'scala_metrics.json'
    )

    const resultadoVocacionalPath = path.join(
      outputDir,
      'resultado_vocacional.json'
    )

    if (!fsSync.existsSync(parsedJsonPath)) {
      throw new Error(
        'Python no generó parsed_notas.json'
      )
    }

    if (!fsSync.existsSync(scalaMetricsPath)) {
      throw new Error(
        'Scala no generó scala_metrics.json'
      )
    }

    if (!fsSync.existsSync(resultadoVocacionalPath)) {
      throw new Error(
        'Prolog no generó resultado_vocacional.json'
      )
    }

    const parsedData = JSON.parse(
      fsSync.readFileSync(
        parsedJsonPath,
        'utf8'
      )
    )

    const scalaMetrics = JSON.parse(
      fsSync.readFileSync(
        scalaMetricsPath,
        'utf8'
      )
    )

    const resultadoVocacional = JSON.parse(
      fsSync.readFileSync(
        resultadoVocacionalPath,
        'utf8'
      )
    )

    // =====================================================
    // RESPUESTA FINAL
    // =====================================================

    return NextResponse.json({
      status: 'success',

      pipeline:
        '[PY] ➔ [SCALA] ➔ [PROLOG] completados',

      parsedData,

      scalaMetrics,

      resultadoVocacional
    })

  } catch (err: any) {

    console.error(
      'Error en pipeline:',
      err
    )

    return NextResponse.json(
      {
        status: 'error',
        error:
          err?.message ||
          'Error desconocido en el pipeline'
      },
      {
        status: 500
      }
    )
  }
}