import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """      let newZoom = W / 1170;
      if (newZoom > 1.5) newZoom = 1.5;
      if (newZoom < 0.4) newZoom = 0.4;"""

replace = """      let newZoom = W / 1170;
      if (newZoom > 1.0) newZoom = 1.0;
      if (newZoom < 0.4) newZoom = 0.4;"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced max zoom")
else:
    print("Failed to replace max zoom")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)