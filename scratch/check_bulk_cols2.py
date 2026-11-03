with open("src/components/modals/Modals.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(1280, 1330):
        print(f"{j+1}: {lines[j].rstrip()}")
    print("-----")
    for j in range(1415, 1460):
        if "history" in lines[j].lower():
            print(f"{j+1}: {lines[j].rstrip()}")