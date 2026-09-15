import argparse
import json
import os
import re
from pypdf import PdfReader

def main():
    parser = argparse.ArgumentParser(description="Parser dinámico de certificados PDF")
    parser.add_argument('--file', required=True, help="Nombre del archivo PDF en data/entrada")
    args = parser.parse_args()

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    input_path = os.path.join(base_dir, 'data', 'entrada', args.file)
    output_json_path = os.path.join(base_dir, 'data', 'entrada', 'parsed_notas.json')

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"No se encontró el archivo: {input_path}")

    reader = PdfReader(input_path)
    full_text = ""
    for page in reader.pages:
        full_text += (page.extract_text() or "") + "\n"

    lines = [line.strip() for line in full_text.split('\n') if line.strip()]
    
    materias = []
    promedio_general = None
    ignore_words = ["asignatura", "nota", "resultado", "escala", "calificación", "aprobado", "desaprobado", "ciclo", "periodo", "promedio general"]

    i = 0
    while i < len(lines):
        line = lines[i]
        line_low = line.lower()

        # Detectar promedio general
        if "promedio general" in line_low:
            num_match = re.search(r'(\d+(?:\.\d+)?)', line)
            if not num_match and i + 1 < len(lines):
                num_match = re.search(r'(\d+(?:\.\d+)?)', lines[i+1])
            if num_match:
                promedio_general = float(num_match.group(1))
            i += 1
            continue

        # Ignorar líneas basura o de encabezado puro con números que no son notas de materias
        if any(w in line_low for w in ["escala", "asignatura nota"]):
            i += 1
            continue

        # Patrón A: Línea con texto de materia, siguiente línea la nota numérica (0-20)
        if not re.search(r'\d', line) and i + 1 < len(lines):
            next_line = lines[i+1].strip()
            grade_match = re.search(r'^(20|1[0-9]|0?[0-9])(?:\.\d+)?$', next_line)
            if grade_match and not any(w in line_low for w in ignore_words):
                materias.append({
                    "nombre": line,
                    "nota": float(grade_match.group(0))
                })
                i += 2
                continue

        # Patrón B: Línea unificada tipo "Matemática 18" o "Matemática 18 Aprobado"
        single_match = re.search(r'^([^\d]+?)\s+(20|1[0-9]|0?[0-9])(?:\.\d+)?(?:\s+(Aprobado|Desaprobado))?$', line, re.IGNORECASE)
        if single_match:
            sub_name = single_match.group(1).strip()
            if not any(w in sub_name.lower() for w in ignore_words) and len(sub_name) > 2:
                materias.append({
                    "nombre": sub_name,
                    "nota": float(single_match.group(2))
                })
                i += 1
                continue

        i += 1

    parsed_data = {
        "archivo_analizado": args.file,
        "promedio_general": promedio_general,
        "materias": materias
    }

    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(parsed_data, f, indent=2, ensure_ascii=False)

    print(json.dumps({"status": "parsed_ok", "json_path": output_json_path, "extracted_count": len(materias)}))

if __name__ == '__main__':
    main()