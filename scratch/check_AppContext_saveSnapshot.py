import re
with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    code = f.read()
    if "saveSnapshot" in code:
        print("saveSnapshot is already imported!")
    else:
        print("saveSnapshot is NOT imported.")