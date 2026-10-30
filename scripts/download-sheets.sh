#!/bin/bash
# Download all sheets from the public Google Sheet by trying gid 0-25
# Output: one CSV per sheet that has data

SHEET_ID="1JZiRlDnxBjAHBfwXQhh_zJKOreT1ilJZCSLc5dFCdEA"
OUT_DIR="/home/z/my-project/seagull-data"
mkdir -p "$OUT_DIR"
cd "$OUT_DIR"

# Remove old files
rm -f sheet_*.csv sheets_index.txt

for gid in {0..25}; do
  OUT="sheet_${gid}.csv"
  curl -sL "https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}" -o "$OUT"
  
  # Count non-empty lines
  LINES=$(grep -c "." "$OUT" 2>/dev/null || echo 0)
  
  # Skip if it's an error page (HTML)
  if head -1 "$OUT" | grep -q "<!DOCTYPE\|<html\|Error\|抱歉\|cannot"; then
    rm "$OUT"
    continue
  fi
  
  if [ "$LINES" -gt 0 ]; then
    SIZE=$(wc -c < "$OUT")
    # Try to identify sheet by looking at the first cell
    FIRST=$(head -1 "$OUT" | cut -d, -f1 | tr -d '"')
    echo "gid=${gid} lines=${LINES} size=${SIZE}B first_cell=${FIRST}" | tee -a sheets_index.txt
  else
    rm "$OUT"
  fi
done

echo ""
echo "=== Summary ==="
echo "Total sheets downloaded: $(ls sheet_*.csv 2>/dev/null | wc -l)"
echo ""
echo "=== Sheets preview ==="
for f in sheet_*.csv; do
  [ -f "$f" ] || continue
  echo ""
  echo "--- $f (first 3 lines) ---"
  head -3 "$f"
done
