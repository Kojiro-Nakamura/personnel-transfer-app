with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    start_idx = -1
    for i, line in enumerate(lines):
        if "export const addPlanSheet" in line:
            start_idx = i
            break
    if start_idx != -1:
        for i in range(start_idx, start_idx+800):
            if i < len(lines):
                if "isCurrTransferred" in lines[i] or "isNextTransferred" in lines[i] or "cell.fill =" in lines[i]:
                    print(f"{i+1}: {lines[i].rstrip()}")