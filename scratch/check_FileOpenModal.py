with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "function FileOpenModal" in line or "const FileOpenModal" in line:
            print(f"{j+1}: {line.strip()}")
            for k in range(j+1, j+30):
                print(f"{k+1}: {lines[k].rstrip()}")
            break