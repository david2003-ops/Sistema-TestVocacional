% =========================================================
% RECOMENDADOR VOCACIONAL
% Lee los perfiles generados por Scala
% y obtiene las 5 carreras con mayor compatibilidad
% =========================================================

:- use_module(library(json)).

:- consult('reglas.pl').

% Guardamos la carpeta donde se encuentra este archivo
:- prolog_load_context(directory, Dir),
   assertz(prolog_directory(Dir)).


% ---------------------------------------------------------
% Obtener ruta de scala_metrics.json
% ---------------------------------------------------------

ruta_metricas(Ruta) :-
    prolog_directory(Dir),

    directory_file_path(
        Dir,
        '../data/entrada/scala_metrics.json',
        RutaRelativa
    ),

    absolute_file_name(
        RutaRelativa,
        Ruta,
        [access(read)]
    ).


% ---------------------------------------------------------
% Leer los cinco perfiles desde el JSON de Scala
% ---------------------------------------------------------

leer_perfiles(
    Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo
) :-
    ruta_metricas(Ruta),

    setup_call_cleanup(
        open(
            Ruta,
            read,
            Stream,
            [encoding(utf8)]
        ),

        json_read_dict(Stream, Datos),

        close(Stream)
    ),

    Perfiles = Datos.perfiles,

    Tecnologico = Perfiles.tecnologico,
    Cientifico = Perfiles.cientifico,
    Numerico = Perfiles.numerico,
    Humanistico = Perfiles.humanistico,
    SocialComunicativo = Perfiles.social_comunicativo.


% ---------------------------------------------------------
% Obtener las 5 carreras recomendadas
% ---------------------------------------------------------

recomendar(Top5) :-
    leer_perfiles(
        Tecnologico,
        Cientifico,
        Numerico,
        Humanistico,
        SocialComunicativo
    ),

    top_carreras(
        Tecnologico,
        Cientifico,
        Numerico,
        Humanistico,
        SocialComunicativo,
        Top5
    ).


% ---------------------------------------------------------
% Mostrar perfiles y recomendaciones en consola
% ---------------------------------------------------------

mostrar_recomendaciones :-
    leer_perfiles(
        Tecnologico,
        Cientifico,
        Numerico,
        Humanistico,
        SocialComunicativo
    ),

    recomendar(Top5),

    nl,
    writeln('===== PERFIL ACADEMICO ====='),

    format(
        'Tecnologico: ~2f~n',
        [Tecnologico]
    ),

    format(
        'Cientifico: ~2f~n',
        [Cientifico]
    ),

    format(
        'Numerico: ~2f~n',
        [Numerico]
    ),

    format(
        'Humanistico: ~2f~n',
        [Humanistico]
    ),

    format(
        'Social-Comunicativo: ~2f~n',
        [SocialComunicativo]
    ),

    nl,
    writeln('===== TOP 5 CARRERAS ====='),

    mostrar_top(Top5, 1).


% ---------------------------------------------------------
% Mostrar ranking
% ---------------------------------------------------------

mostrar_top([], _).

mostrar_top(
    [Puntaje-Carrera | Resto],
    Posicion
) :-
    format(
        '~d. ~w - ~2f%~n',
        [
            Posicion,
            Carrera,
            Puntaje
        ]
    ),

    Siguiente is Posicion + 1,

    mostrar_top(
        Resto,
        Siguiente
    ).

    % =========================================================
% RESULTADO VOCACIONAL ESTRUCTURADO
% =========================================================

resultado_vocacional(Resultado) :-
    leer_perfiles(
        Tecnologico,
        Cientifico,
        Numerico,
        Humanistico,
        SocialComunicativo
    ),

    recomendar(Top5),

    leer_perfil_dominante(PerfilDominante),

    convertir_recomendaciones(
        Top5,
        Recomendaciones
    ),

    Resultado = _{
        perfil_dominante: PerfilDominante,

        perfiles: _{
            tecnologico: Tecnologico,
            cientifico: Cientifico,
            numerico: Numerico,
            humanistico: Humanistico,
            social_comunicativo: SocialComunicativo
        },

        recomendaciones: Recomendaciones
    }.


% ---------------------------------------------------------
% Leer perfil dominante generado por Scala
% ---------------------------------------------------------

leer_perfil_dominante(PerfilDominante) :-
    ruta_metricas(Ruta),

    setup_call_cleanup(
        open(
            Ruta,
            read,
            Stream,
            [encoding(utf8)]
        ),

        json_read_dict(Stream, Datos),

        close(Stream)
    ),

    PerfilDominante = Datos.perfil_dominante.


% ---------------------------------------------------------
% Convertir el TOP 5 a una estructura preparada para JSON
% ---------------------------------------------------------

convertir_recomendaciones([], []).

convertir_recomendaciones(
    [Puntaje-Carrera | Resto],
    [Recomendacion | Recomendaciones]
) :-
    Recomendacion = _{
        carrera: Carrera,
        compatibilidad: Puntaje
    },

    convertir_recomendaciones(
        Resto,
        Recomendaciones
    ).

    % =========================================================
% GUARDAR RESULTADO VOCACIONAL EN JSON
% =========================================================

guardar_resultado :-
    resultado_vocacional(Resultado),

    prolog_directory(Dir),

    directory_file_path(
        Dir,
        '../data/salida',
        CarpetaSalidaRelativa
    ),

    absolute_file_name(
        CarpetaSalidaRelativa,
        CarpetaSalida,
        [
            file_type(directory),
            access(none)
        ]
    ),

    make_directory_path(CarpetaSalida),

    directory_file_path(
        CarpetaSalida,
        'resultado_vocacional.json',
        ArchivoSalida
    ),

    setup_call_cleanup(
        open(
            ArchivoSalida,
            write,
            Stream,
            [encoding(utf8)]
        ),

        json_write_dict(
            Stream,
            Resultado,
            [width(80)]
        ),

        close(Stream)
    ).