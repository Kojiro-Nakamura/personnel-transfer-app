import sys

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if "export const addCurrentBasePlanSheet =" in line:
        start_idx = i
        break

if start_idx != -1:
    brace_count = 0
    for i in range(start_idx, len(lines)):
        line = lines[i]
        brace_count += line.count("{")
        brace_count -= line.count("}")
        if brace_count == 0 and i > start_idx:
            end_idx = i
            break

if start_idx != -1 and end_idx != -1:
    with open("scratch/addCurrentBasePlanSheet.js", "w", encoding="utf8") as f:
        f.writelines(lines[start_idx:end_idx+1])
    print(f"Extracted from {start_idx+1} to {end_idx+1}")
else:
    print("Failed to extract.")