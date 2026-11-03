import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace("alert('ƐEԍvE‚܂łB');", "alert('上書きするデータがありませんでした。（ファイル内のデータと現在のデータが同じか、対象の職員が見つかりません）');")

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.write(code)