import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Replace colNumber <= 33 and colNumber === 33
code = re.sub(r"else if \(colNumber <= 33\) \{\s*argb = 'FFFDF4FF';\s*if \(colNumber === 33 && nextPromoColor\) \{", 
              r"else if (colNumber <= 35) {\n         argb = 'FFFDF4FF';\n         if (colNumber === 35 && nextPromoColor) {", code)

# Replace colNumber > 33 and hcOffset = colNumber - 34
code = re.sub(r"if \(colNumber > 33\) \{\s*const hcOffset = colNumber - 34;", 
              r"if (colNumber > 35) {\n         const hcOffset = colNumber - 36;", code)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
print("Regex replacements applied!")