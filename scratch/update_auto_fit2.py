import os

with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

search = """      const W = window.innerWidth;
      // 基準幅1300pxに対してどれくらいか。actZoom = zoom * 0.9。
      // なので、W / 1300 を actZoom にしたい。
      // zoom = (W / 1300) / 0.9 = W / 1170
      let newZoom = W / 1170;
      if (newZoom > 1.0) newZoom = 1.0;
      if (newZoom < 0.4) newZoom = 0.4;
      setZoom(newZoom);"""

replace = """      const W = window.innerWidth;
      // 基準幅を少し広めに設定（1300 -> 1400強程度を想定）して、やや小さめにフィットさせる
      let baseZoom = W / 1300;
      // 10%刻み（0.1単位）で切り捨てて、画面に確実に収まるようにする
      let newZoom = Math.floor(baseZoom * 10) / 10;
      
      if (newZoom > 1.0) newZoom = 1.0;
      if (newZoom < 0.4) newZoom = 0.4;
      setZoom(newZoom);"""

if search in code:
    code = code.replace(search, replace)
    print("Replaced auto fit logic")
else:
    print("Failed to replace auto fit logic")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)