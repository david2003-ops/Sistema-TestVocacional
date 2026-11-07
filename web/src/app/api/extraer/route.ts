import { NextResponse } from 'next/server'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { comandoPython, ejecutarProceso } from '@/lib/ejecutar-proceso'

export const runtime = 'nodejs'
const MAX_PDF_BYTES = 10 * 1024 * 1024

export async function POST(request: Request) {
  let carpetaTemporal: string | undefined
  try {
    const formData = await request.formData()
    const archivo = formData.get('file')
    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: 'Selecciona un certificado PDF.' }, { status: 400 })
    }
    if (!archivo.name.toLowerCase().endsWith('.pdf') || archivo.size > MAX_PDF_BYTES || archivo.size === 0) {
      return NextResponse.json({ error: 'Se requiere un PDF válido de hasta 10 MB.' }, { status: 400 })
    }
    const contenido = Buffer.from(await archivo.arrayBuffer())
    if (contenido.subarray(0, 5).toString('ascii') !== '%PDF-') {
      return NextResponse.json({ error: 'El archivo seleccionado no es un PDF válido.' }, { status: 400 })
    }

    // Un directorio distinto por PDF: no se pisan los archivos de otras solicitudes.
    carpetaTemporal = await mkdtemp(path.join(tmpdir(), 'vocacional-'))
    const pdfTemporal = path.join(carpetaTemporal, 'certificado.pdf')
    const jsonTemporal = path.join(carpetaTemporal, 'notas.json')
    await writeFile(pdfTemporal, contenido)
    const base = path.resolve(process.cwd(), '..')
    await ejecutarProceso(comandoPython(), [
      path.join(base, 'python', 'parser.py'),
      '--input', pdfTemporal,
      '--output', jsonTemporal,
    ], { cwd: base, timeoutMs: 30_000 })

    const parsed = JSON.parse(await readFile(jsonTemporal, 'utf8'))
    return NextResponse.json({
      status: 'preview_ok',
      parsedData: {
        archivo_analizado: archivo.name.slice(0, 150),
        promedio_general: parsed.promedio_general,
        materias: parsed.materias,
      },
      analisis: parsed.analisis,
      advertencias: parsed.advertencias ?? [],
    })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'No se pudo leer el certificado.'
    console.error('Error de extracción:', error)
    return NextResponse.json({ error: mensaje }, { status: 400 })
  } finally {
    if (carpetaTemporal) await rm(carpetaTemporal, { recursive: true, force: true }).catch(() => {})
  }
}
