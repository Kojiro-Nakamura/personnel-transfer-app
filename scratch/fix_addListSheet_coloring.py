with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

t = """      // inCCg (Nx̘g)
      if (colNumber >= 25 && colNumber <= 32) {
         const pKeysOffset = colNumber - 24;"""

r = """      // inCCg (Nx̘g)
      if (colNumber >= 27 && colNumber <= 34) {
         const pKeysOffset = colNumber - 26;"""

if t in code:
    code = code.replace(t, r)
    with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
        f.write(code)
    print("Fixed!")
else:
    print("Could not find text to replace!")