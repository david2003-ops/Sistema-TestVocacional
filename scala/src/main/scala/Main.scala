package vocacional

import scala.io.Source
import java.io.{File, PrintWriter}

object Main {

  def main(args: Array[String]): Unit = {

    val baseDir = new File("..").getCanonicalFile

    val inputPath =
      new File(baseDir, "data/entrada/parsed_notas.json")

    val outputPath =
      new File(baseDir, "data/entrada/scala_metrics.json")

    // -----------------------------------
    // Verificar archivo generado por Python
    // -----------------------------------

    if (!inputPath.exists()) {
      println(
        s"Error: No se encontró ${inputPath.getPath}"
      )
      System.exit(1)
    }

    // -----------------------------------
    // Leer JSON generado por Python
    // -----------------------------------

    val source =
      Source.fromFile(inputPath, "UTF-8")

    val jsonContent =
      try source.mkString
      finally source.close()

    val json = ujson.read(jsonContent)

    // -----------------------------------
    // Convertir materias del JSON
    // -----------------------------------

    val materias =
      json("materias")
        .arr
        .map { materia =>

          Materia(
            nombre = materia("nombre").str,
            nota = materia("nota").num
          )

        }
        .toSeq

    println(
      s"Materias recibidas desde Python: ${materias.size}"
    )

    materias.foreach { materia =>
      println(
        s"- ${materia.nombre}: ${materia.nota}"
      )
    }

    // -----------------------------------
    // Calcular perfiles vocacionales
    // -----------------------------------

    val resultado =
      ProfileCalculator.calculate(materias)

    // -----------------------------------
    // Crear JSON para Prolog
    // -----------------------------------

    val outputJson =
      ujson.Obj(
        "promedio_general" ->
          resultado.promedioGeneral,

        "materias_detectadas" ->
          resultado.materiasDetectadas,

        "perfiles" ->
          ujson.Obj(
            "tecnologico" ->
              resultado.perfiles("tecnologico"),

            "cientifico" ->
              resultado.perfiles("cientifico"),

            "numerico" ->
              resultado.perfiles("numerico"),

            "humanistico" ->
              resultado.perfiles("humanistico"),

            "social_comunicativo" ->
              resultado.perfiles("social_comunicativo")
          ),

        "perfil_dominante" ->
          resultado.perfilDominante
      )

    // -----------------------------------
    // Guardar scala_metrics.json
    // -----------------------------------

    val writer =
      new PrintWriter(outputPath, "UTF-8")

    try {
      writer.write(
        ujson.write(
          outputJson,
          indent = 2
        )
      )
    } finally {
      writer.close()
    }

    // -----------------------------------
    // Resultado por consola
    // -----------------------------------

    println()
    println("===== RESULTADO SCALA =====")

    println(
      s"Promedio general: ${resultado.promedioGeneral}"
    )

    println(
      s"Perfil tecnológico: ${resultado.perfiles("tecnologico")}%"
    )

    println(
      s"Perfil científico: ${resultado.perfiles("cientifico")}%"
    )

    println(
      s"Perfil numérico: ${resultado.perfiles("numerico")}%"
    )

    println(
      s"Perfil humanístico: ${resultado.perfiles("humanistico")}%"
    )

    println(
      s"Perfil social-comunicativo: ${resultado.perfiles("social_comunicativo")}%"
    )

    println(
      s"Perfil dominante: ${resultado.perfilDominante}"
    )

    println()
    println(
      s"Scala metrics generated: ${outputPath.getPath}"
    )
  }
}