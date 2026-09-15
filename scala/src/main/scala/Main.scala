package vocacional

import scala.io.Source
import java.io.{File, PrintWriter}

object Main {
  def main(args: Array[String]): Unit = {
    val baseDir = new File("..").getCanonicalFile
    val inputPath = new File(baseDir, "data/entrada/parsed_notas.json")
    val outputPath = new File(baseDir, "data/entrada/scala_metrics.json")

    if (!inputPath.exists()) {
      println(s"Error: No se encontró ${inputPath.getPath}")
      System.exit(1)
    }

    val source = Source.fromFile(inputPath, "UTF-8")
    val jsonContent = try source.mkString finally source.close()

    // Extraer pares {"nombre": "...", "nota": XX.X}
    val regex = """\"nombre\"\s*:\s*\"([^\"]+)\"\s*,\s*\"nota\"\s*:\s*([\d\.]+)""".r
    val matches = regex.findAllMatchIn(jsonContent).map { m =>
      m.group(1) -> m.group(2).toDouble
    }.toList

    val totalMaterias = matches.size
    val sumaNotas = matches.map(_._2).sum
    val promedioCalculado = if (totalMaterias > 0) sumaNotas / totalMaterias else 0.0

    // Clasificación STEM vs. Humanidades
    val stemKeywords = List("matemática", "matematica", "física", "fisica", "ciencia", "tecnología", "tecnologia", "informática", "informatica")
    val (stemGrades, humGrades) = matches.partition { case (name, _) =>
      stemKeywords.exists(k => name.toLowerCase.contains(k))
    }

    val stemAvg = if (stemGrades.nonEmpty) stemGrades.map(_._2).sum / stemGrades.size else 0.0
    val humAvg = if (humGrades.nonEmpty) humGrades.map(_._2).sum / humGrades.size else 0.0
    val dominantArea = if (stemAvg >= humAvg) "STEM" else "HUMANIDADES"

    val metricsJson = s"""|{
                         |  "total_materias": $totalMaterias,
                         |  "promedio_scala": $promedioCalculado,
                         |  "stem_avg": $stemAvg,
                         |  "humanidades_avg": $humAvg,
                         |  "area_dominante": "$dominantArea"
                         |}""".stripMargin

    val writer = new PrintWriter(outputPath, "UTF-8")
    try writer.write(metricsJson) finally writer.close()

    println(s"Scala metrics generated: $outputPath")
  }
}