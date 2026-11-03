import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """<span className="font-bold text-sm text-slate-50">配置先の枠をクリックしてください</span>"""
replace = """<span className="font-bold text-sm text-slate-50">来年度の配属先の枠をクリックしてください</span>"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced message successfully")
else:
    print("Could not find message string")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)