with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t = """<img src="/favicon.svg" alt="Logo" className="w-7 h-7 rounded shadow-sm" />"""
r = """<img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Logo" className="w-7 h-7 rounded shadow-sm" />"""

code = code.replace(t, r)

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)