with open("src/hooks/useAppMutations.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(10, 30):
        print(f"{j+1}: {lines[j].rstrip()}")