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
      return NextResponse.json({ error: 'No se adjuntó ningún archivo' }, { status: 400 })
    }

    const baseDir = path.join(process.cwd(), '..')
    const uploadDir = path.join(baseDir, 'data', 'entrada')
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, file.name)
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // 1. Ejecutar Python [PY]
    const pythonScriptPath = path.join(baseDir, 'python', 'parser.py')
    await execPromise(`python "${pythonScriptPath}" --file "${file.name}"`)

    // 2. Ejecutar Scala [SCALA] vía sbt
    const scalaDir = path.join(baseDir, 'scala')
    if (fsSync.existsSync(scalaDir)) {
      await execPromise(`sbt "run"`, { cwd: scalaDir })
    }

    // 3. Leer salidas combinadas
    const parsedJsonPath = path.join(uploadDir, 'parsed_notas.json')
    const scalaMetricsPath = path.join(uploadDir, 'scala_metrics.json')

    const parsedData = fsSync.existsSync(parsedJsonPath) 
      ? JSON.parse(fsSync.readFileSync(parsedJsonPath, 'utf8')) 
      : {}
    
    const scalaMetrics = fsSync.existsSync(scalaMetricsPath) 
      ? JSON.parse(fsSync.readFileSync(scalaMetricsPath, 'utf8')) 
      : {}

    return NextResponse.json({
      status: 'success',
      pipeline: '[PY] ➔ [SCALA] completados',
      parsedData,
      scalaMetrics
    })
  } catch (err: any) {
    console.error('Error en pipeline:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}