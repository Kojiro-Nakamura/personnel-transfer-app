import re
with open("src/components/modals/PartialImportConfirmModal.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(25, 45):
        if j < len(lines):
            print(f"{j+1}: {lines[j].rstrip()}")