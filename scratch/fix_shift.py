with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

def replace_between(start, end, func):
    for i in range(start-1, end):
        lines[i] = func(lines[i])

# For processEmps
def fix_process_emps(line):
    line = line.replace("vals[15] = emp.nextEmploymentType", "vals[16] = emp.nextEmploymentType")
    line = line.replace("vals[14] = ns", "vals[15] = ns")
    line = line.replace("vals[13] = calculateAge", "vals[14] = calculateAge")
    line = line.replace("vals[12] = emp.nextGrade", "vals[13] = emp.nextGrade")
    line = line.replace("vals[11] = emp.nextTitle", "vals[12] = emp.nextTitle")
    line = line.replace("vals[10] = getGroupNameStr", "vals[11] = getGroupNameStr")
    line = line.replace("vals[9] = getDeptNameStr", "vals[10] = getDeptNameStr")
    line = line.replace("vals[9] = '配置待ち'", "vals[10] = '配置待ち'")
    line = line.replace("vals[9] = '退職'", "vals[10] = '退職'")
    if "vals[8] = '→';" in line:
        return "        vals[8] = emp.currentEmploymentType || '';\n        vals[9] = '→';\n"
    return line

replace_between(2518, 2555, fix_process_emps)

def fix_unassigned(line):
    line = line.replace("v[15] = emp.nextEmploymentType", "v[16] = emp.nextEmploymentType")
    line = line.replace("v[14] = ns", "v[15] = ns")
    line = line.replace("v[13] = calculateAge", "v[14] = calculateAge")
    line = line.replace("v[12] = emp.nextGrade", "v[13] = emp.nextGrade")
    line = line.replace("v[11] = emp.nextTitle", "v[12] = emp.nextTitle")
    line = line.replace("v[10] = getGroupNameStr", "v[11] = getGroupNameStr")
    line = line.replace("v[9] = getDeptNameStr", "v[10] = getDeptNameStr")
    line = line.replace("v[9] = '配置待ち'", "v[10] = '配置待ち'")
    line = line.replace("v[9] = '退職'", "v[10] = '退職'")
    if "v[8] = '→';" in line:
        return "      v[8] = emp.currentEmploymentType || '';\n      v[9] = '→';\n"
    return line

replace_between(2690, 2735, fix_unassigned)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)