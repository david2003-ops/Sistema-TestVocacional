:- begin_tests(recomendador).

:- consult('recomendador.pl').


test(resultado_contiene_cinco_recomendaciones) :-
    resultado_vocacional(Resultado),

    get_dict(
        recomendaciones,
        Resultado,
        Recomendaciones
    ),

    length(Recomendaciones, 5).


test(resultado_contiene_perfil_dominante) :-
    resultado_vocacional(Resultado),

    get_dict(
        perfil_dominante,
        Resultado,
        Perfil
    ),

    nonvar(Perfil).
    
test(genera_archivo_resultado_json) :-
    catch(
        guardar_resultado,
        _Error,
        fail
    ),

    exists_file(
        '../data/salida/resultado_vocacional.json'
    ).

:- end_tests(recomendador).