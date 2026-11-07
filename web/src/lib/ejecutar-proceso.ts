/** Ejecuta Python / Scala / Prolog sin pasar datos del usuario por un shell. */
import { spawn } from 'node:child_process'

type Opciones = {
  cwd?: string
  stdin?: string
  timeoutMs?: number
}

export function ejecutarProceso(
  comando: string,
  argumentos: string[],
  opciones: Opciones = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hijo = spawn(comando, argumentos, {
      cwd: opciones.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      shell: false,
      env: {
        ...process.env,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
      },
    })
    let salida = ''
    let errores = ''
    let terminado = false
    const terminar = (error?: Error, valor?: string) => {
      if (terminado) return
      terminado = true
      clearTimeout(limite)
      if (error) reject(error)
      else resolve(valor ?? '')
    }
    const limite = setTimeout(() => {
      hijo.kill()
      terminar(new Error(`El proceso '${comando}' excedió el tiempo de ejecución.`))
    }, opciones.timeoutMs ?? 30_000)

    hijo.stdout.setEncoding('utf8')
    hijo.stderr.setEncoding('utf8')
    hijo.stdout.on('data', (trozo: string) => {
      salida += trozo
      if (salida.length > 2_000_000) {
        hijo.kill()
        terminar(new Error('La salida del proceso excede el tamaño permitido.'))
      }
    })
    hijo.stderr.on('data', (trozo: string) => {
      errores += trozo
      if (errores.length > 2_000_000) {
        hijo.kill()
        terminar(new Error('El proceso registró demasiados mensajes de error.'))
      }
    })
    hijo.on('error', (err: Error) => terminar(err))
    hijo.on('close', (codigo: number | null) => {
      if (codigo !== 0) {
        terminar(new Error(errores.trim() || `El proceso finalizó con código ${codigo}.`))
      } else {
        terminar(undefined, salida.trim())
      }
    })
    hijo.stdin.on('error', () => {
      // El error de proceso se reporta por 'error' o 'close'.
    })
    hijo.stdin.end(opciones.stdin ?? '')
  })
}

export function comandoPython(): string {
  return process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3')
}
