import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Let's inspect where `c === 1 || c === 2` logic is.