with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("（今：〇人／来：〇人）の人数カウントを出力する", "（〇人→〇人）の人数カウントを出力する")

with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.write(code)