with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(165, 175):
        if "selEmp =" in lines[i] or "const selEmp" in lines[i]:
            for j in range(max(0, i-5), i+15):
                print(f"{j+1}: {lines[j].rstrip()}")
            break