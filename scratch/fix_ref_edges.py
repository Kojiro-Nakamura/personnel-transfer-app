import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# Update header isLeftEdge
old_h_left = "const isLeftEdge = [1, 4, 11].includes(c);"
new_h_left = "const isLeftEdge = [1, 4, 11, 19, 22, 30, 40].includes(c);"
code = code.replace(old_h_left, new_h_left)

old_h_right = "const isRightEdge = [3, 9, 17, totalCols].includes(c);"
new_h_right = "const isRightEdge = [3, 9, 17, 21, 29, 39, totalCols].includes(c);"
code = code.replace(old_h_right, new_h_right)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)