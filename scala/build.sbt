ThisBuild / scalaVersion := "2.13.16"

ThisBuild / organization := "com.vocacional"
ThisBuild / version := "0.1.0"

lazy val root = (project in file("."))
  .settings(
    name := "vocacional-scala",

    libraryDependencies ++= Seq(
      "com.lihaoyi" %% "ujson" % "3.3.1",
      "org.scalameta" %% "munit" % "1.0.0" % Test
    )
  )