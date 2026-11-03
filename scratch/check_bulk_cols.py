with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1250, 1300):
        if "<th" in lines[j] or "history" in lines[j].lower() or "履歴" in lines[j]:
            print(f"{j+1}: {lines[j].rstrip()}")