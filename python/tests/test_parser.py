import pytest
from pathlib import Path
from pypdf import PdfWriter

from parser import extraer_datos_de_texto, extraer_texto_pdf
from validador import ValidacionError


def test_lee_decimales_de_una_sola_linea():
    texto = "Matemática 18.75 Aprobado\nComunicación 12.5\nInformática 19.25"
    resultado = extraer_datos_de_texto(texto)
    assert [m["nota"] for m in resultado["materias"]] == [18.75, 12.5, 19.25]


def test_lee_decimales_en_lineas_separadas_y_coma():
    texto = "Matemática\n18,5\nComunicación\n12.25\nInformática\n19"
    resultado = extraer_datos_de_texto(texto)
    assert [m["nota"] for m in resultado["materias"]] == [18.5, 12.25, 19.0]


def test_detecta_promedio_sin_confundirlo_con_materia():
    texto = "Promedio general: 16.5\nMatemática 19\nComunicación 12\nInglés 17"
    resultado = extraer_datos_de_texto(texto)
    assert resultado["promedio_general"] == 16.5
    assert len(resultado["materias"]) == 3


def test_no_acepta_menos_de_tres_materias():
    with pytest.raises(ValidacionError, match="al menos 3 materias"):
        extraer_datos_de_texto("Matemática 18.5\nInformática 17")


def test_documento_pdf_sin_texto_informa_falta_de_ocr(tmp_path: Path):
    archivo = tmp_path / "vacio.pdf"
    escritor = PdfWriter()
    escritor.add_blank_page(width=612, height=792)
    with archivo.open("wb") as f:
        escritor.write(f)
    with pytest.raises(ValidacionError, match="OCR"):
        extraer_texto_pdf(archivo)


def test_ignora_escala_de_notas_sin_incluirla_como_materia():
    texto = (
        "Certificado de estudios\n"
        "Escala de calificación\n"
        "0 a 20\n"
        "Matemática 19\n"
        "Comunicación 11\n"
        "Ciencia y Tecnología 15\n"
        "Historia y Ciencias Sociales 14\n"
        "Inglés 16\n"
        "Informática 17\n"
        "Orientación Vocacional 14\n"
        "Promedio general 15.14\n"
    )
    resultado = extraer_datos_de_texto(texto)
    assert len(resultado["materias"]) == 7
    assert all(m["nombre"] != "0 a" for m in resultado["materias"])
    assert resultado["analisis"]["promedio_calculado"] == 15.14
    assert resultado["advertencias"] == []
