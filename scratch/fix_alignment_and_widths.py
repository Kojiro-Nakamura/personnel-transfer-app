import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. Fix the second extraCols array widths
def replace_extracols_widths(text):
    # Find all extraCols arrays
    def repl(m):
        inner = m.group(1)
        lines = inner.split('\n')
        new_lines = []
        for line in lines:
            if '(AD)' in line or '(AE)' in line or '(AF)' in line or '(AG)' in line or '(AH)' in line or '(AI)' in line or '(AJ)' in line or '(AK)' in line or '(AL)' in line:
                new_lines.append(re.sub(r'width:\s*[\d\.]+', 'width: 15', line))
            else:
                new_lines.append(line)
        return "const extraCols = [\n" + '\n'.join(new_lines) + "\n  ];"
    
    return re.sub(r'const extraCols = \[\n(.*?)\n  \];', repl, text, flags=re.DOTALL)

code = replace_extracols_widths(code)

# 2. Fix the alignment to 'left' for 配属希望 (c=28) and 特殊事情 (c=29)
t1 = """          const isNoShrink = (c === 28 || c === 29);
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: !isNoShrink, wrapText: false };"""

r1 = """          const isNoShrink = (c === 28 || c === 29);
          const alignStr = isNoShrink ? 'left' : 'center';
          cell.alignment = { vertical: 'middle', horizontal: alignStr, shrinkToFit: !isNoShrink, wrapText: false };"""

code = code.replace(t1, r1)

t2 = """          const isNoShrink = (c === 28 || c === 29);
          cell.alignment = { vertical: 'middle', horizontal: 'center', shrinkToFit: !isNoShrink, wrapText: false };"""

# We can just do a global replace for all instances of t1
code = code.replace(t1, r1)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)