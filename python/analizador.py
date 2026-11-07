"""Análisis descriptivo, separado del cálculo de perfiles realizado por Scala."""

from normalizador import area_materia


def analizar_materias(materias: list[dict]) -> dict:
    """La entrada ya debe haber pasado por validar_materias."""
    ordenadas = sorted(materias, key=lambda x: (-x["nota"], x["nombre"]))
    asc = sorted(materias, key=lambda x: (x["nota"], x["nombre"]))
    promedio = round(sum(m["nota"] for m in materias) / len(materias), 2)
    reconocidas = sorted({area_materia(m["nombre"]) for m in materias} - {None})
    fortalezas = [m for m in ordenadas if m["nota"] >= 16]
    por_reforzar = [m for m in asc if m["nota"] <= 12]

    return {
        "promedio_calculado": promedio,
        "materias_analizadas": len(materias),
        "nota_maxima": ordenadas[0]["nota"],
        "nota_minima": asc[0]["nota"],
        "mejores_notas": ordenadas[:3],
        "menores_notas": asc[:3],
        "fortalezas": fortalezas,
        "areas_por_reforzar": por_reforzar,
        "areas_detectadas": reconocidas,
        "total_areas_detectadas": len(reconocidas),
        "criterios": {
            "fortaleza": "Nota mayor o igual a 16/20",
            "reforzar": "Nota menor o igual a 12/20",
        },
        "nota_metodologica": (
            "Análisis descriptivo del rendimiento académico, no diagnóstico "
            "psicológico ni predicción de aptitud profesional."
        ),
    }
