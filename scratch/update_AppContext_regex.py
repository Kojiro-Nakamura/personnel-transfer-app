import re
with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    code = f.read()

# Add import
if "saveSnapshot" not in code:
    code = code.replace("import { useExportActions } from '../hooks/useExportActions.js';",
                        "import { useExportActions } from '../hooks/useExportActions.js';\nimport { saveSnapshot } from '../utils/indexedDB.js';")

# Update loadJSON
code = re.sub(
    r"(const data = JSON\.parse\(text\);\s+loadFromData\(data, file\.name\);)",
    r"\1\n      saveSnapshot(file.name, data).catch(err => console.error('Failed to save snapshot on load:', err));",
    code
)

with open("src/contexts/AppContext.jsx", "w", encoding="utf8") as f:
    f.write(code)
print("Replaced successfully via regex.")