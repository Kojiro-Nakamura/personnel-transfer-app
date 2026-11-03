import re

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t = """          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-white" />
            <div className="flex items-center bg-white/20 border border-white/30 rounded overflow-hidden p-1">"""

r = """          <div className="flex items-center gap-3">
            <img src="/favicon.svg" alt="Logo" className="w-7 h-7 rounded shadow-sm" />
            <div className="flex items-center bg-white/20 border border-white/30 rounded overflow-hidden p-1">"""

code = code.replace(t, r)

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)