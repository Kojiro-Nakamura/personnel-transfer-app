with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(1580, 1610):
        if "getPromotedBgColorCode" in lines[i] or "nextGrade" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")
    print("---")
    for i in range(2150, 2180):
        if "getPromotedBgColorCode" in lines[i] or "nextGrade" in lines[i]:
            print(f"{i+1}: {lines[i].rstrip()}")