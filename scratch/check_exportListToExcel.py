import re
with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Let's search for same colNumber logic
match = re.search(r"if \(colNumber >= 25 && colNumber <= 32\)", code)
if match:
    print("Found duplicated logic!")
else:
    print("No duplicates found!")