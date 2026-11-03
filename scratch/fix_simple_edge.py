import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_header_left = "const leftB = [14, 15, 16, 17, 25, 35].includes(c) ? 'thick' : true;"
new_header_left = "const leftB = [14, 17, 25, 35].includes(c) ? 'thick' : true;"

old_header_right = "const rightB = [14, 15, 16, 24, 34, totalCols].includes(c) ? 'thick' : true;"
new_header_right = "const rightB = [16, 24, 34, totalCols].includes(c) ? 'thick' : true;"

old_data_left = "const isLeftEdge = [14, 15, 16, 17, 25, 35].includes(c);"
new_data_left = "const isLeftEdge = [14, 17, 25, 35].includes(c);"

old_data_right = "const isRightEdge = [14, 15, 16, 24, 34, totalCols].includes(c);"
new_data_right = "const isRightEdge = [16, 24, 34, totalCols].includes(c);"

if old_header_left in code and old_data_left in code:
    code = code.replace(old_header_left, new_header_left)
    code = code.replace(old_header_right, new_header_right)
    code = code.replace(old_data_left, new_data_left)
    code = code.replace(old_data_right, new_data_right)
    print("Fixed borders in addSimplePlanSheet")
else:
    print("Could not find border search strings in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)