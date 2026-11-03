with open("src/hooks/useAppHistory.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for j in range(10, 50):
        print(f"{j+1}: {lines[j].rstrip()}")