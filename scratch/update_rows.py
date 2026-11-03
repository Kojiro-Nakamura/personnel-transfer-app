import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if "ws.getRow(3).font = { name: 'BIZ UDP" in line and "size: 9, color: { argb: 'FF0284C7' } };" in line and i > 850 and i < 870:
        new_lines.append("\n")
        new_lines.append("  ws.mergeCells('A2:L2');\n")
        new_lines.append("  ws.getCell('A2').alignment = { shrinkToFit: true, vertical: 'middle' };\n")
        new_lines.append("  ws.mergeCells('A3:L3');\n")
        new_lines.append("  ws.getCell('A3').alignment = { shrinkToFit: true, vertical: 'middle' };\n")
        print("Found and injected!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(new_lines)