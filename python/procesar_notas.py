"""Revalida notas corregidas por el usuario; recibe y devuelve JSON vía stdin/stdout."""

import json
import sys

from validador import validar_materias, ValidacionError
from analizador import analizar_materias


def preparar_evaluacion(payload: dict) -> dict:
    if not isinstance(payload, dict):
        raise ValidacionError("El contenido de la evaluación no es válido.")
    materias, advertencias = validar_materias(payload.get("materias"))
    analisis = analizar_materias(materias)
    nombre = str(payload.get("archivo_analizado") or "Notas confirmadas")
    nombre = nombre[:150]
    return {
        "parsedData": {
            "archivo_analizado": nombre,
            "promedio_general": analisis["promedio_calculado"],
            "materias": materias,
        },
        "analisis": analisis,
        "advertencias": advertencias,
    }


def main() -> int:
    try:
        payload = json.load(sys.stdin)
        print(json.dumps(preparar_evaluacion(payload), ensure_ascii=False))
        return 0
    except (ValidacionError, ValueError, json.JSONDecodeError) as exc:
        print(str(exc), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
