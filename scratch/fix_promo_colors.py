import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("'係長(主査)'", "'係長級(主査)'")
code = code.replace("'補佐I(主任)'", "'補佐級I(主任)'")
code = code.replace("'補佐II(班長)'", "'補佐級II(班長)'")
code = code.replace("'補佐III(補佐兼班長)'", "'補佐級III(補佐兼班長)'")
code = code.replace("'課長'", "'課長級'")
code = code.replace("'所属長'", "'所属長級'")
code = code.replace("'次長'", "'次長級'")
code = code.replace("'部長'", "'部長級'")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)