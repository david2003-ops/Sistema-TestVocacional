:- begin_tests(reglas_vocacionales).

:- consult('reglas.pl').

test(ingenieria_sistemas_perfil_fuerte) :-
    compatibilidad(
        ingenieria_sistemas,
        93,
        84,
        93,
        90,
        87.5,
        Puntaje
    ),
    Puntaje >= 85.

test(ingenieria_software_perfil_fuerte) :-
    compatibilidad(
        ingenieria_software,
        93,
        84,
        93,
        90,
        87.5,
        Puntaje
    ),
    Puntaje >= 85.

    test(catalogo_tiene_19_carreras) :-
    findall(Carrera, carrera(Carrera), Carreras),
    length(Carreras, 19).


test(todas_las_carreras_calculan_compatibilidad) :-
    forall(
        carrera(Carrera),
        (
            compatibilidad(
                Carrera,
                93,   % tecnologico
                84,   % cientifico
                93,   % numerico
                90,   % humanistico
                87.5, % social-comunicativo
                Puntaje
            ),
            Puntaje >= 0,
            Puntaje =< 100
        )
    ).

    test(top5_devuelve_cinco_carreras_ordenadas) :-
    top_carreras(
        93,   % tecnologico
        84,   % cientifico
        93,   % numerico
        90,   % humanistico
        87.5, % social-comunicativo
        Top5
    ),

    length(Top5, 5),

    Top5 = [
        P1-_,
        P2-_,
        P3-_,
        P4-_,
        P5-_
    ],

    P1 >= P2,
    P2 >= P3,
    P3 >= P4,
    P4 >= P5.

:- end_tests(reglas_vocacionales).