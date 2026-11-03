import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search = """  ws.pageSetup.orientation = 'portrait';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;"""

replace = """  ws.pageSetup.orientation = 'portrait';
  ws.pageSetup.fitToPage = true;
  ws.pageSetup.fitToWidth = 1;
  ws.pageSetup.fitToHeight = 0;
  ws.pageSetup.horizontalCentered = true;
  ws.pageSetup.margins = { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 };"""

if search in code:
    code = code.replace(search, replace)
    print("Added standard margins and horizontal center to addSimplePlanSheet")
else:
    print("Could not find page setup block in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)