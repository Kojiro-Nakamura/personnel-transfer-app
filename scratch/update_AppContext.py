import re
with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    code = f.read()

# Add import
if "saveSnapshot" not in code:
    code = code.replace("import { useExportActions } from '../hooks/useExportActions.js';",
                        "import { useExportActions } from '../hooks/useExportActions.js';\nimport { saveSnapshot } from '../utils/indexedDB.js';")

# Update loadJSON
t = """    try {
      const text = await file.text();
      const data = JSON.parse(text);
      loadFromData(data, file.name);
    } catch(err) {"""

r = """    try {
      const text = await file.text();
      const data = JSON.parse(text);
      loadFromData(data, file.name);
      saveSnapshot(file.name, data).catch(err => console.error("Failed to save snapshot on load:", err));
    } catch(err) {"""

if t in code:
    code = code.replace(t, r)
    with open("src/contexts/AppContext.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Replaced successfully.")
else:
    print("Could not find the target text!")