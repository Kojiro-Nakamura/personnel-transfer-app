import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = re.sub(r"if \(colNumber >= 25 && colNumber <= 32\) \{\s*const pKeysOffset = colNumber - 24;", 
              r"if (colNumber >= 27 && colNumber <= 34) {\n         const pKeysOffset = colNumber - 26;", 
              code)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)
print("Done")