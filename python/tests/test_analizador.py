from analizador import analizar_materias
from procesar_notas import preparar_evaluacion


def test_fortalezas_y_areas_por_reforzar():
    materias = [
        {"nombre": "Matemática", "nota": 19},
        {"nombre": "Informática", "nota": 17},
        {"nombre": "Comunicación", "nota": 11},
    ]
    analisis = analizar_materias(materias)
    assert analisis["promedio_calculado"] == 15.67
    assert {m["nombre"] for m in analisis["fortalezas"]} == {"Matemática", "Informática"}
    assert [m["nombre"] for m in analisis["areas_por_reforzar"]] == ["Comunicación"]


def test_valida_y_analiza_notas_corregidas():
    resultado = preparar_evaluacion({
        "archivo_analizado": "certificado.pdf",
        "materias": [
            {"nombre": "Matemática", "nota": 18.5},
            {"nombre": "Comunicación", "nota": 12},
            {"nombre": "Informática", "nota": 19},
        ],
    })
    assert resultado["parsedData"]["promedio_general"] == 16.5
    assert resultado["analisis"]["nota_maxima"] == 19


def test_historia_y_ciencias_sociales_no_se_confunde_con_ciencias():
    from normalizador import area_materia
    assert area_materia("Historia y Ciencias Sociales") == "historia"
    assert area_materia("Ciencia y Tecnología") == "ciencia"
