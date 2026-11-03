with open("scratch/addCurrentBasePlanSheet_fixed.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "row.values = vals;" in line:
            for j in range(max(0, i-5), i+5):
                print(f"{j+1}: {lines[j].rstrip()}")
            print("-----")