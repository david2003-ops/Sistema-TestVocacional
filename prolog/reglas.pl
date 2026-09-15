% =========================================================
% SISTEMA DE ORIENTACION VOCACIONAL
% Motor experto basado en rendimiento academico
%
% Entradas:
% Tecnologico
% Cientifico
% Numerico
% Humanistico
% SocialComunicativo
%
% Escala: 0 - 100
% =========================================================


% =========================================================
% CATALOGO DE CARRERAS
% =========================================================

carrera(ingenieria_sistemas).
carrera(ingenieria_software).
carrera(ciencia_datos).
carrera(ingenieria_electronica).
carrera(ingenieria_industrial).
carrera(ingenieria_civil).
carrera(ingenieria_mecanica).
carrera(arquitectura).
carrera(medicina).
carrera(enfermeria).
carrera(biologia).
carrera(psicologia).
carrera(derecho).
carrera(comunicacion).
carrera(administracion).
carrera(economia).
carrera(contabilidad).
carrera(marketing).
carrera(educacion).


% =========================================================
% INGENIERIA DE SISTEMAS
% =========================================================

compatibilidad(
    ingenieria_sistemas,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    _SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Tecnologico * 0.40 +
        Numerico * 0.35 +
        Cientifico * 0.25.


% =========================================================
% INGENIERIA DE SOFTWARE
% =========================================================

compatibilidad(
    ingenieria_software,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    _SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Tecnologico * 0.45 +
        Numerico * 0.35 +
        Cientifico * 0.20.


% =========================================================
% CIENCIA DE DATOS
% =========================================================

compatibilidad(
    ciencia_datos,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    _SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.45 +
        Tecnologico * 0.30 +
        Cientifico * 0.25.


% =========================================================
% INGENIERIA ELECTRONICA
% =========================================================

compatibilidad(
    ingenieria_electronica,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    _SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Tecnologico * 0.35 +
        Cientifico * 0.35 +
        Numerico * 0.30.


% =========================================================
% INGENIERIA INDUSTRIAL
% =========================================================

compatibilidad(
    ingenieria_industrial,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.40 +
        Cientifico * 0.25 +
        Tecnologico * 0.20 +
        SocialComunicativo * 0.15.


% =========================================================
% INGENIERIA CIVIL
% =========================================================

compatibilidad(
    ingenieria_civil,
    Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.35 +
        Cientifico * 0.35 +
        Tecnologico * 0.20 +
        Humanistico * 0.05 +
        SocialComunicativo * 0.05.


% =========================================================
% INGENIERIA MECANICA
% =========================================================

compatibilidad(
    ingenieria_mecanica,
    Tecnologico,
    Cientifico,
    Numerico,
    _Humanistico,
    _SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.40 +
        Cientifico * 0.35 +
        Tecnologico * 0.25.


% =========================================================
% ARQUITECTURA
% =========================================================

compatibilidad(
    arquitectura,
    Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Tecnologico * 0.25 +
        Numerico * 0.25 +
        Humanistico * 0.25 +
        Cientifico * 0.15 +
        SocialComunicativo * 0.10.


% =========================================================
% MEDICINA
% =========================================================

compatibilidad(
    medicina,
    _Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Cientifico * 0.50 +
        SocialComunicativo * 0.25 +
        Humanistico * 0.15 +
        Numerico * 0.10.


% =========================================================
% ENFERMERIA
% =========================================================

compatibilidad(
    enfermeria,
    _Tecnologico,
    Cientifico,
    _Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Cientifico * 0.40 +
        SocialComunicativo * 0.40 +
        Humanistico * 0.20.


% =========================================================
% BIOLOGIA
% =========================================================

compatibilidad(
    biologia,
    _Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Cientifico * 0.60 +
        Numerico * 0.15 +
        SocialComunicativo * 0.15 +
        Humanistico * 0.10.


% =========================================================
% PSICOLOGIA
% =========================================================

compatibilidad(
    psicologia,
    _Tecnologico,
    Cientifico,
    _Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        SocialComunicativo * 0.45 +
        Humanistico * 0.35 +
        Cientifico * 0.20.


% =========================================================
% DERECHO
% =========================================================

compatibilidad(
    derecho,
    _Tecnologico,
    _Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Humanistico * 0.50 +
        SocialComunicativo * 0.40 +
        Numerico * 0.10.


% =========================================================
% COMUNICACION
% =========================================================

compatibilidad(
    comunicacion,
    Tecnologico,
    _Cientifico,
    _Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        SocialComunicativo * 0.50 +
        Humanistico * 0.45 +
        Tecnologico * 0.05.


% =========================================================
% ADMINISTRACION
% =========================================================

compatibilidad(
    administracion,
    Tecnologico,
    _Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        SocialComunicativo * 0.30 +
        Numerico * 0.30 +
        Tecnologico * 0.20 +
        Humanistico * 0.20.


% =========================================================
% ECONOMIA
% =========================================================

compatibilidad(
    economia,
    Tecnologico,
    _Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.50 +
        Humanistico * 0.20 +
        Tecnologico * 0.15 +
        SocialComunicativo * 0.15.


% =========================================================
% CONTABILIDAD
% =========================================================

compatibilidad(
    contabilidad,
    Tecnologico,
    _Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        Numerico * 0.55 +
        SocialComunicativo * 0.20 +
        Humanistico * 0.15 +
        Tecnologico * 0.10.


% =========================================================
% MARKETING
% =========================================================

compatibilidad(
    marketing,
    Tecnologico,
    _Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        SocialComunicativo * 0.40 +
        Humanistico * 0.30 +
        Tecnologico * 0.15 +
        Numerico * 0.15.


% =========================================================
% EDUCACION
% =========================================================

compatibilidad(
    educacion,
    _Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Puntaje
) :-
    Puntaje is
        SocialComunicativo * 0.45 +
        Humanistico * 0.35 +
        Cientifico * 0.10 +
        Numerico * 0.10.

        % =========================================================
% TOP 5 DE CARRERAS
% =========================================================

top_carreras(
    Tecnologico,
    Cientifico,
    Numerico,
    Humanistico,
    SocialComunicativo,
    Top5
) :-
    findall(
        Puntaje-Carrera,
        (
            carrera(Carrera),

            compatibilidad(
                Carrera,
                Tecnologico,
                Cientifico,
                Numerico,
                Humanistico,
                SocialComunicativo,
                Puntaje
            )
        ),
        Resultados
    ),

    keysort(Resultados, Ascendente),

    reverse(
        Ascendente,
        Descendente
    ),

    length(Top5, 5),

    append(
        Top5,
        _Resto,
        Descendente
    ).