"""Validaciones de documentos y calificaciones (escala peruana de 0 a 20)."""

from pathlib import Path
import math
from typing import Any

from normalizador import clave_materia, area_materia

MAX_PDF_BYTES = 10 * 1024 * 1024
MAX_PDF_PAGES = 20
MIN_MATERIAS = 3


class ValidacionError(ValueError):
    """Error apto para mostrar como mensaje al estudiante."""


def validar_archivo_pdf(ruta: str | Path) -> Path:
    archivo = Path(ruta)
    if not archivo.is_file():
        raise ValidacionError("No se encontró el archivo PDF seleccionado.")
    if archivo.suffix.lower() != ".pdf":
        raise ValidacionError("El archivo debe tener la extensión .pdf.")
    if archivo.stat().st_size > MAX_PDF_BYTES:
        raise ValidacionError("El PDF supera el máximo permitido de 10 MB.")
    if archivo.stat().st_size < 8:
        raise ValidacionError("El PDF está vacío o incompleto.")
    with archivo.open("rb") as f:
        if not f.read(5) == b"%PDF-":
            raise ValidacionError("El archivo no contiene una cabecera PDF válida.")
    return archivo


def _nota_numerica(valor: Any) -> float:
    if isinstance(valor, bool):
        raise ValidacionError("La nota debe ser numérica.")
    if isinstance(valor, str):
        valor = valor.strip().replace(",", ".")
        if not valor:
            raise ValidacionError("Hay una nota vacía.")
    try:
        nota = float(valor)
    except (TypeError, ValueError, OverflowError) as exc:
        raise ValidacionError(f"La nota '{valor}' no es numérica.") from exc
    if not math.isfinite(nota) or not 0 <= nota <= 20:
        raise ValidacionError("Las notas deben estar entre 0 y 20.")
    return round(nota, 2)


def validar_materias(datos: Any) -> tuple[list[dict], list[str]]:
    """Limpia notas y agrupa asignaturas repetidas mediante su media aritmética."""
    if not isinstance(datos, list):
        raise ValidacionError("La lista de materias tiene un formato incorrecto.")
    if len(datos) > 150:
        raise ValidacionError("Se encontraron demasiadas materias (máximo 150).")

    agrupadas: dict[str, dict] = {}
    for idx, item in enumerate(datos, 1):
        if not isinstance(item, dict):
            raise ValidacionError(f"La materia {idx} tiene un formato incorrecto.")
        nombre = item.get("nombre")
        if not isinstance(nombre, str) or not nombre.strip():
            raise ValidacionError(f"La materia {idx} no tiene nombre.")
        nombre = " ".join(nombre.strip().split())
        if len(nombre) > 100 or not any(c.isalpha() for c in nombre):
            raise ValidacionError(f"El nombre de la materia {idx} no es válido.")
        nota = _nota_numerica(item.get("nota"))
        clave = clave_materia(nombre)
        if clave in agrupadas:
            agrupadas[clave]["notas"].append(nota)
        else:
            agrupadas[clave] = {"nombre": nombre, "notas": [nota]}

    limpias = [
        {"nombre": v["nombre"], "nota": round(sum(v["notas"]) / len(v["notas"]), 2)}
        for v in agrupadas.values()
    ]
    advertencias = []
    repetidas = [v["nombre"] for v in agrupadas.values() if len(v["notas"]) > 1]
    if repetidas:
        advertencias.append("Se promediaron materias repetidas: " + ", ".join(repetidas) + ".")
    if len(limpias) < MIN_MATERIAS:
        raise ValidacionError(
            f"Se necesitan al menos {MIN_MATERIAS} materias distintas para continuar; "
            f"se identificaron {len(limpias)}."
        )
    areas = {area_materia(m["nombre"]) for m in limpias} - {None}
    if not areas:
        raise ValidacionError(
            "No se reconocieron asignaturas relacionadas con los perfiles de Scala. "
            "Corrige los nombres de las materias antes de continuar."
        )
    if len(areas) < 3:
        advertencias.append(
            "Se identificaron menos de 3 áreas académicas reconocidas por el sistema; "
            "las recomendaciones pueden ser poco representativas."
        )
    return limpias, advertencias
