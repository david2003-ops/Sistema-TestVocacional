"""Extrae materias y calificaciones desde PDF con texto seleccionable.

Compatible con el uso anterior: python python/parser.py --file certificado.pdf
También admite --input y --output para aislar cada extracción en la API.
"""

import argparse
import json
from pathlib import Path
import re
import sys

from pypdf import PdfReader

from validador import (
    validar_archivo_pdf,
    validar_materias,
    ValidacionError,
    MAX_PDF_PAGES,
)
from analizador import analizar_materias


NOTA = r"(?:20(?:[.,]0+)?|1[0-9](?:[.,][0-9]+)?|0?[0-9](?:[.,][0-9]+)?)"
PATRON_NOTA = re.compile(rf"^{NOTA}$")
PATRON_MATERIA = re.compile(
    rf"^(?P<nombre>.+?)\s+(?P<nota>{NOTA})(?:\s+(?:APROBADO|DESAPROBADO))?$",
    re.IGNORECASE,
)
PATRON_PROMEDIO = re.compile(r"promedio\s+(?:general|final)", re.IGNORECASE)
PATRON_NUMERO = re.compile(r"\b\d+(?:[.,]\d+)?\b")
PALABRAS_DESCARTADAS = (
    "escala", "asignatura", "calificacion", "calificación", "promedio",
    "documento", "estudiante", "nombre", "grado", "resultado",
    "periodo", "período", "codigo", "código", "dni", "firma",
)


def es_materia(nombre: str) -> bool:
    t = " ".join(nombre.lower().strip(" :-").split())
    # Evita interpretar escalas como "0 a 20" como materias "0 a" con nota 20.
    if len(t) < 3 or not any(letra.isalpha() for letra in t) or t[0].isdigit():
        return False
    return not any(t.startswith(p) for p in PALABRAS_DESCARTADAS)


def extraer_texto_pdf(archivo: Path) -> str:
    validar_archivo_pdf(archivo)
    try:
        lector = PdfReader(str(archivo), strict=False)
        if lector.is_encrypted:
            raise ValidacionError("El PDF está protegido con contraseña.")
        paginas = len(lector.pages)
        if paginas == 0 or paginas > MAX_PDF_PAGES:
            raise ValidacionError(f"El PDF debe tener entre 1 y {MAX_PDF_PAGES} páginas.")
        texto = "\n".join((pagina.extract_text() or "") for pagina in lector.pages)
    except ValidacionError:
        raise
    except Exception as exc:
        raise ValidacionError("No se pudo leer el PDF. Comprueba que no esté dañado.") from exc
    if not texto.strip():
        raise ValidacionError(
            "El PDF no contiene texto seleccionable. Si es una imagen escaneada, "
            "necesitarás OCR (aún no implementado)."
        )
    return texto


def extraer_datos_de_texto(texto: str) -> dict:
    """Función pura para probar sin crear archivos PDF."""
    lineas = [line.strip() for line in texto.splitlines() if line.strip()]
    materias = []
    promedio_documento = None
    i = 0
    while i < len(lineas):
        linea = lineas[i]

        if PATRON_PROMEDIO.search(linea):
            despues = PATRON_PROMEDIO.split(linea, maxsplit=1)[-1].strip(" :")
            candidato = PATRON_NUMERO.search(despues)
            if candidato is None and i + 1 < len(lineas):
                siguiente = lineas[i + 1]
                candidato = PATRON_NOTA.fullmatch(siguiente)
                if candidato:
                    i += 1
            if candidato:
                valor = float(candidato.group(0).replace(",", "."))
                if 0 <= valor <= 20:
                    promedio_documento = valor
            i += 1
            continue

        # Formato partido: "Matemática" + salto de línea + "18.75".
        if i + 1 < len(lineas) and es_materia(linea):
            siguiente = PATRON_NOTA.fullmatch(lineas[i + 1])
            if siguiente:
                materias.append({
                    "nombre": linea.strip(" :-"),
                    "nota": float(siguiente.group(0).replace(",", ".")),
                })
                i += 2
                continue

        # Formato de una línea: "Matemática 18.75 Aprobado".
        encontrado = PATRON_MATERIA.fullmatch(linea)
        if encontrado and es_materia(encontrado.group("nombre")):
            materias.append({
                "nombre": encontrado.group("nombre").strip(" :-"),
                "nota": float(encontrado.group("nota").replace(",", ".")),
            })
        i += 1

    materias_limpias, advertencias = validar_materias(materias)
    analisis = analizar_materias(materias_limpias)
    if promedio_documento is not None and abs(promedio_documento - analisis["promedio_calculado"]) > 0.2:
        advertencias.append(
            "El promedio indicado en el documento difiere del promedio simple "
            "calculado; verifica si la institución usa ponderaciones por año o crédito."
        )
    return {
        "promedio_general": promedio_documento,
        "materias": materias_limpias,
        "analisis": analisis,
        "advertencias": advertencias,
    }


def main() -> int:
    argumentos = argparse.ArgumentParser(description="Extrae calificaciones de un certificado PDF")
    seleccion = argumentos.add_mutually_exclusive_group(required=True)
    seleccion.add_argument("--file", help="Nombre del PDF dentro de data/entrada (modo anterior)")
    seleccion.add_argument("--input", help="Ruta completa al PDF (modo API)")
    argumentos.add_argument("--output", help="Ruta JSON de salida, opcional")
    args = argumentos.parse_args()
    base = Path(__file__).resolve().parent.parent

    if args.file:
        if Path(args.file).name != args.file:
            print("--file solo admite el nombre del PDF, sin rutas.", file=sys.stderr)
            return 1
        archivo = base / "data" / "entrada" / args.file
    else:
        archivo = Path(args.input).resolve()
    salida = Path(args.output).resolve() if args.output else base / "data" / "entrada" / "parsed_notas.json"
    try:
        resultados = extraer_datos_de_texto(extraer_texto_pdf(archivo))
        parsed = {
            "archivo_analizado": archivo.name,
            "promedio_general": resultados["promedio_general"],
            "materias": resultados["materias"],
            "analisis": resultados["analisis"],
            "advertencias": resultados["advertencias"],
        }
        salida.parent.mkdir(parents=True, exist_ok=True)
        salida.write_text(json.dumps(parsed, ensure_ascii=False, indent=2), encoding="utf-8")
        print(json.dumps({
            "status": "parsed_ok", "json_path": str(salida),
            "extracted_count": len(parsed["materias"]),
            "advertencias": parsed["advertencias"],
        }, ensure_ascii=False))
        return 0
    except (ValidacionError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
