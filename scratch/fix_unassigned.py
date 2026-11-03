with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    lines = f.readlines()

def fix_line(line):
    if "vals[9] = '未配置';" in line:
        return line.replace("vals[9] = '未配置';", "vals[10] = '未配置';")
    if "v[9] = '未配置';" in line:
        return line.replace("v[9] = '未配置';", "v[10] = '未配置';")
    return line

for i in range(len(lines)):
    lines[i] = fix_line(lines[i])

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.writelines(lines)