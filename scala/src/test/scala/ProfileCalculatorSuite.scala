package vocacional

class ProfileCalculatorSuite extends munit.FunSuite {

  test("calcula correctamente los cinco perfiles academicos") {

    val materias = Seq(
      Materia("Matemática", 19),
      Materia("Comunicación", 11),
      Materia("Ciencia y Tecnología", 18),
      Materia("Historia y Ciencias Sociales", 13),
      Materia("Inglés", 15),
      Materia("Informática", 19)
    )

    val resultado = ProfileCalculator.calculate(materias)

    assert(math.abs(resultado.perfiles("tecnologico") - 94.0) < 0.01)
    assert(math.abs(resultado.perfiles("cientifico") - 92.0) < 0.01)
    assert(math.abs(resultado.perfiles("numerico") - 95.0) < 0.01)
    assert(math.abs(resultado.perfiles("humanistico") - 64.0) < 0.01)
    assert(math.abs(resultado.perfiles("social_comunicativo") - 62.5) < 0.01)

    assertEquals(resultado.perfilDominante, "numerico")
  }
}