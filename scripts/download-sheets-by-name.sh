#!/bin/bash
# Try downloading each sheet by NAME using the gviz endpoint
SHEET_ID="1JZiRlDnxBjAHBfwXQhh_zJKOreT1ilJZCSLc5dFCdEA"
OUT_DIR="/home/z/my-project/seagull-data"
mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

# List of sheet names from the panel
SHEETS=(
  "PANEL"
  "Respuestas de formulario"
  "CONFIG"
  "CONTACTOS"
  "SERVICIOS"
  "COTIZACIONES"
  "COTIZACION_DETALLE"
  "LOG_AUTOMATIZACION"
  "PROYECTOS"
  "TAREAS"
  "CONTRATOS"
  "AGENDA"
  "INGRESOS"
  "EGRESOS"
  "RESUMEN"
  "LANZAMIENTOS"
  "CHECKLIST"
  "CATÁLOGO"
  "COLABORADORES"
  "INVENTARIO"
  "COPIA_SEGURIDAD"
)

rm -f named_*.csv sheets_index.txt

for sheet in "${SHEETS[@]}"; do
  # URL-encode the sheet name (handle spaces and special chars)
  ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$sheet'))")
  OUT="named_${sheet// /_}.csv"
  OUT="${OUT//[^a-zA-Z0-9_.-]/_}"
  
  URL="https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${ENCODED}"
  curl -sL "$URL" -o "$OUT"
  
  # Skip if it's an error page (HTML)
  if head -1 "$OUT" | grep -q "<!DOCTYPE\|<html\|Error\|cannot\|Html Convert"; then
    LINES=$(grep -c "." "$OUT" 2>/dev/null || echo 0)
    rm "$OUT"
    echo "FAIL  : $sheet (HTML error)"
    continue
  fi
  
  LINES=$(grep -c "." "$OUT" 2>/dev/null || echo 0)
  SIZE=$(wc -c < "$OUT")
  
  if [ "$LINES" -gt 0 ] && [ "$SIZE" -gt 50 ]; then
    echo "OK    : $sheet (lines=${LINES} size=${SIZE}B)"
    echo "${sheet}|${OUT}|${LINES}|${SIZE}" >> sheets_index.txt
  else
    rm "$OUT"
    echo "EMPTY : $sheet (lines=${LINES})"
  fi
done

echo ""
echo "=== Summary ==="
TOTAL=$(ls named_*.csv 2>/dev/null | wc -l)
echo "Total sheets downloaded: $TOTAL"
