with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if "export const addSimplePlanSheet" in line:
            start_idx = i
        if start_idx != -1 and "export const exportPlanToExcel" in line:
            end_idx = i
            break
    
    with open("scratch/simple_sheet_orig.js", "w", encoding="utf8") as out:
        out.writelines(lines[start_idx:end_idx])