package vocacional

import java.text.Normalizer

case class Materia(
  nombre: String,
  nota: Double
)

case class ProfileResult(
  promedioGeneral: Double,
  perfiles: Map[String, Double],
  perfilDominante: String,
  materiasDetectadas: Int
)

object ProfileCalculator {

  private def normalizar(texto: String): String = {
    Normalizer
      .normalize(texto.toLowerCase, Normalizer.Form.NFD)
      .replaceAll("\\p{M}", "")
      .trim
  }

  private def buscarNota(
    materias: Seq[Materia],
    palabras: Seq[String]
  ): Option[Double] = {

    materias.find { materia =>
      val nombre = normalizar(materia.nombre)

      palabras.exists { palabra =>
        nombre.contains(normalizar(palabra))
      }
    }.map(_.nota)
  }

  private def normalizarNota(nota: Double): Double = {
    nota * 5.0
  }

  private def calcularPonderado(
    elementos: Seq[(Option[Double], Double)]
  ): Double = {

    val disponibles = elementos.collect {
      case (Some(nota), peso) =>
        (normalizarNota(nota), peso)
    }

    if (disponibles.isEmpty) {
      0.0
    } else {

      val sumaPesos =
        disponibles.map(_._2).sum

      val resultado =
        disponibles
          .map {
            case (nota, peso) =>
              nota * peso
          }
          .sum / sumaPesos

      redondear(resultado)
    }
  }

  private def redondear(valor: Double): Double = {
    BigDecimal(valor)
      .setScale(2, BigDecimal.RoundingMode.HALF_UP)
      .toDouble
  }

  def calculate(
    materias: Seq[Materia]
  ): ProfileResult = {

    val matematica =
      buscarNota(materias, Seq("matematica"))

    val comunicacion =
      buscarNota(
        materias,
        Seq("comunicacion", "lenguaje", "lengua")
      )

    val ciencia =
      buscarNota(
        materias,
        Seq(
          "ciencia y tecnologia",
          "ciencia",
          "fisica",
          "quimica",
          "biologia"
        )
      )

    val historia =
      buscarNota(
        materias,
        Seq("historia", "ciencias sociales")
      )

    val ingles =
      buscarNota(materias, Seq("ingles"))

    val informatica =
      buscarNota(
        materias,
        Seq(
          "informatica",
          "computacion",
          "programacion",
          "tecnologia de la informacion"
        )
      )

    val tecnologico =
      calcularPonderado(
        Seq(
          informatica -> 0.50,
          matematica -> 0.30,
          ciencia -> 0.20
        )
      )

    val cientifico =
      calcularPonderado(
        Seq(
          ciencia -> 0.60,
          matematica -> 0.40
        )
      )

    val numerico =
      calcularPonderado(
        Seq(
          matematica -> 0.70,
          informatica -> 0.30
        )
      )

    val humanistico =
      calcularPonderado(
        Seq(
          historia -> 0.50,
          comunicacion -> 0.30,
          ingles -> 0.20
        )
      )

    val socialComunicativo =
      calcularPonderado(
        Seq(
          comunicacion -> 0.50,
          ingles -> 0.25,
          historia -> 0.25
        )
      )

    val perfiles = Map(
      "tecnologico" -> tecnologico,
      "cientifico" -> cientifico,
      "numerico" -> numerico,
      "humanistico" -> humanistico,
      "social_comunicativo" -> socialComunicativo
    )

    val promedio =
      if (materias.nonEmpty)
        redondear(materias.map(_.nota).sum / materias.size)
      else
        0.0

    val dominante =
      perfiles.maxBy(_._2)._1

    ProfileResult(
      promedioGeneral = promedio,
      perfiles = perfiles,
      perfilDominante = dominante,
      materiasDetectadas = materias.size
    )
  }
}