import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

old_header_left = "const leftB = [1, 4, 10, 16, 17, 18, 19, 20, 21, 27, 37].includes(i) ? 'thick' : true;"
new_header_left = "const leftB = [1, 4, 10, 16, 18, 21, 29, 39].includes(i) ? 'thick' : true;"

old_header_right = "const rightB = [3, 9, 15, 16, 17, 18, 19, 20, 26, 36, totalCols].includes(i) ? 'thick' : true;"
new_header_right = "const rightB = [3, 9, 15, 16, 20, 28, 38, totalCols].includes(i) ? 'thick' : true;"

old_data_left = "const isLeftEdge = colNumber === 1 || colNumber === 4 || colNumber === 10 || colNumber === 16;"
new_data_left = "const isLeftEdge = [1, 4, 10, 16, 18, 21, 29, 39].includes(colNumber);"

old_data_right = "const isRightEdge = colNumber === 3 || colNumber === 9 || colNumber === 15 || colNumber === 16;"
new_data_right = "const isRightEdge = [3, 9, 15, 16, 20, 28, 38, totalCols].includes(colNumber);"

if old_header_left in code and old_data_left in code:
    code = code.replace(old_header_left, new_header_left)
    code = code.replace(old_header_right, new_header_right)
    code = code.replace(old_data_left, new_data_left)
    code = code.replace(old_data_right, new_data_right)
    print("Fixed borders in addPlanSheet")
else:
    print("Could not find border search strings in addPlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)