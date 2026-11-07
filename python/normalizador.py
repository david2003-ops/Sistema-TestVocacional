"""Normalización ligera y clasificación descriptiva de asignaturas."""

import re
import unicodedata


def clave_materia(nombre: str) -> str:
    texto = unicodedata.normalize("NFD", nombre.casefold())
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    texto = re.sub(r"[^a-z0-9 ]+", " ", texto)
    return " ".join(texto.split())


def area_materia(nombre: str) -> str | None:
    """Devuelve un área académica compatible con las búsquedas de Scala.

    No es una clasificación psicológica: solo identifica asignaturas conocidas.
    """
    n = clave_materia(nombre)
    if any(x in n for x in ("matematica", "aritmetica", "algebra")):
        return "matematica"
    if any(x in n for x in ("informatica", "computacion", "programacion", "tecnologia de la informacion")):
        return "informatica"
    if any(x in n for x in ("historia", "ciencias sociales", "sociales")):
        return "historia"
    if any(x in n for x in ("ciencia", "fisica", "quimica", "biologia")):
        return "ciencia"
    if any(x in n for x in ("comunicacion", "lenguaje", "lengua", "literatura")):
        return "comunicacion"
    if any(x in n for x in ("ingles", "english")):
        return "ingles"
    return None
