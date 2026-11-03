import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """    views: [{ state: 'frozen', xSplit: 3, ySplit: 5, showGridLines: false }],"""
replace = """    views: [{ state: 'frozen', xSplit: 12, ySplit: 5, showGridLines: false }],"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced freeze pane successfully")
else:
    print("Failed to replace freeze pane")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)