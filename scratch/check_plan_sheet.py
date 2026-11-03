with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i in range(len(lines)):
        if "function addPlanSheet" in lines[i] or "const addPlanSheet" in lines[i]:
            for j in range(i, i+600):
                if j < len(lines) and "cell.fill" in lines[j] and "isNextTransferred" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")
            break