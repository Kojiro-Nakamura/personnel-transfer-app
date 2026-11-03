with open("src/contexts/AppContext.jsx", "r", encoding="utf8") as f:
    for line in f:
        if "value={{" in line:
            print("Found value={")
            break
    
    for _ in range(10):
        print(f.readline().rstrip())