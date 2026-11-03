import os

with open("src/hooks/useExportActions.js", "r", encoding="utf8") as f:
    code = f.read()
code = code.replace("（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）", "（${formatCountText(cCounts)}→${formatCountText(nCounts)}）")
code = code.replace("（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）", "（${formatCountText(gCCounts)}→${formatCountText(gNCounts)}）")
with open("src/hooks/useExportActions.js", "w", encoding="utf8") as f:
    f.write(code)

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()
code = code.replace("（今:${formatCountText(cCounts)} / 来:${formatCountText(nCounts)}）", "（${formatCountText(cCounts)}→${formatCountText(nCounts)}）")
code = code.replace("（今:${formatCountText(gCCounts)} / 来:${formatCountText(gNCounts)}）", "（${formatCountText(gCCounts)}→${formatCountText(gNCounts)}）")
with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    code = f.read()
code = code.replace("（今：〇人／来：〇人）", "（〇人→〇人）")
with open("src/components/modals/Modals.jsx", "w", encoding="utf8") as f:
    f.write(code)
