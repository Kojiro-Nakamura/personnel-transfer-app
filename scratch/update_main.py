import re
with open("src/main.jsx", "r", encoding="utf8") as f:
    code = f.read()

if "vite-plugin-pwa/register" not in code:
    code = "import { registerSW } from 'virtual:pwa-register';\nregisterSW({ immediate: true });\n" + code
    with open("src/main.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Service Worker registered.")
else:
    print("Already registered.")