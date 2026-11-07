import pytest

from validador import validar_materias, ValidacionError


def test_valida_y_promedia_materias_duplicadas():
    materias = [
        {"nombre": "Matemática", "nota": "18,5"},
        {"nombre": "MATEMATICA", "nota": "19.5"},
        {"nombre": "Inglés", "nota": 17},
        {"nombre": "Comunicación", "nota": 13},
    ]
    limpias, avisos = validar_materias(materias)
    assert len(limpias) == 3
    assert limpias[0]["nota"] == 19.0
    assert avisos and "repetidas" in avisos[0]


@pytest.mark.parametrize("nota", [21, -1, "abc", "", float("nan"), True])
def test_rechaza_nota_invalida(nota):
    materias = [
        {"nombre": "Matemática", "nota": nota},
        {"nombre": "Comunicación", "nota": 11},
        {"nombre": "Informática", "nota": 17},
    ]
    with pytest.raises(ValidacionError):
        validar_materias(materias)


def test_rechaza_pdf_falso(tmp_path):
    from validador import validar_archivo_pdf
    archivo = tmp_path / "archivo.pdf"
    archivo.write_text("Soy un texto, no un PDF")
    with pytest.raises(ValidacionError, match="cabecera PDF"):
        validar_archivo_pdf(archivo)
