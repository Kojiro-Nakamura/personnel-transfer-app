with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j, line in enumerate(lines):
        if "empGroups.get(key).history.push" in line:
            print(f"{j-3}: {lines[j-3].rstrip()}")
            print(f"{j-2}: {lines[j-2].rstrip()}")
            print(f"{j-1}: {lines[j-1].rstrip()}")
            print(f"{j+1}: {line.rstrip()}")
            print(f"{j+2}: {lines[j+1].rstrip()}")
            print(f"{j+3}: {lines[j+2].rstrip()}")
            print(f"{j+4}: {lines[j+3].rstrip()}")