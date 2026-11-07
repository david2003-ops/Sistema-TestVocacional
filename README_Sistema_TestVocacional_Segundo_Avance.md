# Sistema-TestVocacional | Guía funcional y de ejecución

**Segundo avance · Rama de revisión:** `feature/cielo-python-avance2`  
**Repositorio:** https://github.com/david2003-ops/Sistema-TestVocacional  
**Alcance:** prototipo académico de orientación vocacional basado en notas.  
**Estado comprobado:** 17 pruebas automatizadas de Python aprobadas; compilación de Next.js y flujo web Python → Scala → Prolog probados localmente.

## 1. ¿Qué hace el sistema?

Sistema-TestVocacional permite cargar un **certificado de estudios en PDF**, extraer las notas de las asignaturas y revisarlas antes de obtener un análisis de rendimiento y cinco carreras sugeridas. Las recomendaciones se calculan mediante ponderaciones y reglas predefinidas; **no son probabilidades de éxito profesional ni una evaluación psicológica**.

**Flujo:** PDF → Python (extracción, validación y análisis) → vista previa editable en Next.js → Python (revalidación) → Scala (cinco perfiles) → Prolog (top 5 de carreras) → resultados en la web.

| Componente | Responsabilidad | Archivos principales |
|---|---|---|
| Next.js 16 / React 19 | Subida de PDF, revisión editable, visualización de resultados | `web/src/app/page.tsx`; `web/src/app/api/` |
| Python / pypdf | Lee PDFs con texto, valida notas, normaliza materias, identifica fortalezas | `python/parser.py`, `validador.py`, `normalizador.py`, `analizador.py`, `procesar_notas.py` |
| Scala 2.13 | Calcula perfiles tecnológico, científico, numérico, humanístico y social-comunicativo | `scala/src/main/scala/ProfileCalculator.scala` |
| SWI-Prolog | Aplica las reglas de compatibilidad y ordena las cinco carreras recomendadas | `prolog/reglas.pl`, `prolog/recomendador.pl` |

## 2. Mejoras implementadas en el segundo avance

1. **Lectura de decimales:** reconoce notas como `18.5` y `18,5` sin truncarlas; evita confundir la escala `0 a 20` con una asignatura.
2. **Validación de PDF y notas:** comprueba extensión, cabecera, tamaño (máximo 10 MB), número de páginas (máximo 20), texto seleccionable y notas entre 0 y 20; requiere al menos tres materias distintas y reconoce áreas académicas.
3. **Normalización y análisis:** unifica nombres para la detección de áreas, agrupa duplicados mediante su media y calcula promedio simple, mejores/menores notas y fortalezas (≥16)/áreas por reforzar (≤12).
4. **Vista previa editable:** permite cambiar nombres y notas, añadir y quitar materias y confirmar los datos **antes** de invocar Scala/Prolog. Al confirmar, Python vuelve a validar y recalcular.
5. **Pruebas automatizadas:** módulo `python/tests/` con **17 pruebas pytest aprobadas** en el entorno donde se implementaron las mejoras.
6. **Integración y seguridad local:** endpoints `/api/extraer` y `/api/evaluar`; archivos temporales de extracción separados por solicitud, ejecución sin concatenar datos de usuario al shell y codificación UTF-8. La evaluación Scala/Prolog se ejecuta en cola dentro de la instancia local para evitar solapamientos con JSON de rutas fijas.

**Commits de esta rama:** `2beda28` (Python) y `c66885a` (interfaz web y API). Ninguno modifica `main` por sí mismo.

## 3. Requisitos para ejecutarlo en Windows

Instalar y comprobar que estos comandos funcionen en PowerShell:

| Requisito | Uso | Verificar |
|---|---|---|
| Git | Descargar la rama | `git --version` |
| Python 3.10+ (probado con 3.14.8) | Extracción y análisis | `python --version` |
| Node.js 20.9+ y npm | Ejecutar Next.js | `node --version` y `npm --version` |
| JDK (recomendado 17 o 21) | Máquina virtual para Scala | `java -version` |
| sbt instalado y en PATH | Compilar/ejecutar Scala | `sbt --version` |
| SWI-Prolog instalado y en PATH | Reglas de recomendaciones | `swipl --version` |

Descargas oficiales: https://www.python.org/downloads/ · https://nodejs.org/ · https://www.scala-sbt.org/download · https://www.swi-prolog.org/Download.html

> IMPORTANTE: Para realizar la evaluación completa, no basta con Python y Node.js. También deben estar disponibles `java`, `sbt` y `swipl` desde la terminal.

## 4. Descargar la rama de revisión

**Si aún no tienen el repositorio:**

```powershell
git clone --branch feature/cielo-python-avance2 --single-branch https://github.com/david2003-ops/Sistema-TestVocacional.git
cd Sistema-TestVocacional
```

**Si ya tienen el repositorio clonado:**

```powershell
git fetch origin
git switch --track origin/feature/cielo-python-avance2
```

Si la rama local ya existe, usar `git switch feature/cielo-python-avance2` y después `git pull --ff-only`.

## 5. Instalación inicial (desde la raíz del proyecto)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r python\requirements.txt
cd web
npm ci
```

Si PowerShell bloquea la activación, pueden habilitarla **solo para la sesión actual** con `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` y volver a ejecutar `Activate.ps1`.

El entorno virtual debe permanecer activo en la terminal desde la que se inicie la web. Opcionalmente, desde `web` pueden indicar el Python del proyecto así:

```powershell
$env:PYTHON_BIN = (Resolve-Path ..\.venv\Scripts\python.exe).Path
```

## 6. Levantar la aplicación

Desde la carpeta `web`, con el entorno virtual activo:

```powershell
npm run dev
```

Abrir **http://localhost:3000** (o el puerto que anuncie Next.js). Mantener la terminal abierta mientras se usa la web. Para detenerla, `Ctrl + C`.

**Uso en pantalla:**

1. Elegir el certificado, por ejemplo `data/entrada/certificado_estudios_prueba_2.pdf` (el PDF puede seleccionarse desde cualquier carpeta).
2. Pulsar **EXTRAER NOTAS**. Python comprueba el PDF y muestra las asignaturas detectadas.
3. Revisar la tabla: cambiar notas/nombres, añadir o quitar materias si es necesario.
4. Pulsar **CONFIRMAR NOTAS Y EVALUAR**. Python revalida; Scala calcula cinco perfiles y Prolog devuelve el top 5 de carreras.
5. Consultar promedio, fortalezas, áreas por reforzar, perfil predominante, barras de perfiles y carreras sugeridas.

**Ejemplo de referencia:** con el PDF de prueba original, Python identificó 7 materias y promedio simple **15.14**. Si se editan las notas en pantalla, los resultados cambian al confirmarlas.

## 7. Probar la implementación

Desde la raíz del repositorio, con `.venv` activo:

```powershell
python -m pytest -q python\tests
python python\parser.py --file certificado_estudios_prueba_2.pdf
Get-Content data\entrada\parsed_notas.json -Encoding UTF8
```

Resultado de referencia de las pruebas: `17 passed`. El comando `parser.py` genera o reemplaza `data/entrada/parsed_notas.json`; **puede aparecer como modificado en Git**. Si no necesitan guardar ese JSON de prueba, `git restore -- data/entrada/parsed_notas.json` restaura su versión registrada (descarta esos cambios locales).

Para revisar la compilación web:

```powershell
cd web
npm run build
```

**Pruebas manuales recomendadas para el compañero:** PDF válido; decimal `18,5`; nota inválida `25`; PDF sin texto; quitar/agregar materia; comprobar que los resultados se actualizan tras confirmar. Evitar usar certificados reales con datos personales durante las pruebas públicas.

## 8. Problemas habituales y soluciones

| Mensaje o síntoma | Qué revisar |
|---|---|
| `python` no se reconoce o falla `No module named pypdf` | Instalar Python, activar `.venv` e instalar `python/requirements.txt`; verificar `PYTHON_BIN` si se configuró. |
| `sbt` no se reconoce | Instalar sbt y JDK, reiniciar terminal y comprobar `sbt --version` y `java -version`. |
| `swipl` no se reconoce | Instalar SWI-Prolog y agregar su carpeta `bin` a PATH; reiniciar terminal. |
| PDF sin texto / escaneado | El prototipo no tiene OCR. Usar PDF con texto seleccionable. |
| No aparecen notas o hay advertencias | Revisar formato del certificado y editar la vista previa. El extractor no garantiza compatibilidad con todos los modelos de certificados. |
| Tildes incorrectas | Asegurarse de usar la versión de la rama indicada; el proceso configura `PYTHONIOENCODING=utf-8` y `PYTHONUTF8=1`. Para ver JSON en PowerShell, usar `Get-Content -Encoding UTF8`. |
| Puerto 3000 ocupado | Abrir el puerto alternativo indicado por Next.js o cerrar el proceso anterior. |

## 9. Limitaciones y próximos pasos

- Prototipo orientativo basado principalmente en **rendimiento académico**. No aplica un test psicológico validado ni un modelo entrenado de machine learning.
- No tiene OCR para PDF escaneados; la extracción depende de la estructura del documento.
- Los puntajes de perfil y compatibilidad **no representan probabilidades reales** de éxito en una carrera.
- El flujo Scala/Prolog trabaja con rutas JSON compartidas y una cola local. Para despliegue multiusuario/producción harían falta trabajos aislados, almacenamiento y controles adicionales.
- Es recomendable añadir en una siguiente iteración explicaciones de por qué aparece cada carrera, pruebas de integración y mejores mecanismos de privacidad para certificados.

## 10. Revisión de GitHub

**Rama:** `feature/cielo-python-avance2`  
**Ver cambios:** https://github.com/david2003-ops/Sistema-TestVocacional/tree/feature/cielo-python-avance2  
**Comparar con main:** https://github.com/david2003-ops/Sistema-TestVocacional/compare/main...feature/cielo-python-avance2

El compañero puede revisar esta rama sin fusionarla. Cuando ambos aprueben las modificaciones, pueden crear un Pull Request hacia `main`. Esta guía se entrega como archivo independiente: **no realiza cambios en GitHub**.
