import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. First loop: direct.current (emp)
t1 = """          const changeIndexes = [];
          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {"""
r1 = """          const changeIndexes = [];
          const promoYearMap = {};
          if (emp.promoYearChief) promoYearMap[parseInt(String(emp.promoYearChief).split('-')[0])] = "係長(主査)";
          if (emp.promoYearAssistant1) promoYearMap[parseInt(String(emp.promoYearAssistant1).split('-')[0])] = "補佐I(主任)";
          if (emp.promoYearAssistant2) promoYearMap[parseInt(String(emp.promoYearAssistant2).split('-')[0])] = "補佐II(班長)";
          if (emp.promoYearAssistant3) promoYearMap[parseInt(String(emp.promoYearAssistant3).split('-')[0])] = "補佐III(補佐兼班長)";
          if (emp.promoYearSecHead) promoYearMap[parseInt(String(emp.promoYearSecHead).split('-')[0])] = "課長";
          if (emp.promoYearDivHead) promoYearMap[parseInt(String(emp.promoYearDivHead).split('-')[0])] = "所属長";
          if (emp.promoYearDeputyHead) promoYearMap[parseInt(String(emp.promoYearDeputyHead).split('-')[0])] = "次長";
          if (emp.promoYearDeptHead) promoYearMap[parseInt(String(emp.promoYearDeptHead).split('-')[0])] = "部長";
          row.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {"""

if t1 in code:
    code = code.replace(t1, r1)
    print("Loop 1 replaced!")
else:
    print("Loop 1 not found!")

# 2. Second loop: ext.current (extEmp)
t2 = """          const changeIndexes = [];
          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {"""
r2 = """          const changeIndexes = [];
          const promoYearMap = {};
          if (extEmp.promoYearChief) promoYearMap[parseInt(String(extEmp.promoYearChief).split('-')[0])] = "係長(主査)";
          if (extEmp.promoYearAssistant1) promoYearMap[parseInt(String(extEmp.promoYearAssistant1).split('-')[0])] = "補佐I(主任)";
          if (extEmp.promoYearAssistant2) promoYearMap[parseInt(String(extEmp.promoYearAssistant2).split('-')[0])] = "補佐II(班長)";
          if (extEmp.promoYearAssistant3) promoYearMap[parseInt(String(extEmp.promoYearAssistant3).split('-')[0])] = "補佐III(補佐兼班長)";
          if (extEmp.promoYearSecHead) promoYearMap[parseInt(String(extEmp.promoYearSecHead).split('-')[0])] = "課長";
          if (extEmp.promoYearDivHead) promoYearMap[parseInt(String(extEmp.promoYearDivHead).split('-')[0])] = "所属長";
          if (extEmp.promoYearDeputyHead) promoYearMap[parseInt(String(extEmp.promoYearDeputyHead).split('-')[0])] = "次長";
          if (extEmp.promoYearDeptHead) promoYearMap[parseInt(String(extEmp.promoYearDeptHead).split('-')[0])] = "部長";
          r.promoYearMap = promoYearMap;

          let lastValidHStr = '-';
          historyYears.forEach((hy, idx) => {"""

# Since t1 is the same as t2, we can just replace the second occurrence manually.
parts = code.split(t1)
if len(parts) == 3:
    code = parts[0] + r1 + parts[1] + r2 + parts[2]
    print("Loops replaced with separate vars!")
else:
    print("Could not find exactly 2 occurrences of t1!")


# 3. Replace fill logic inside c >= 40
t3 = """             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFA7F3D0' } }; // Emerald (History)
             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);
             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {"""

r3 = """             const targetRow = typeof row !== 'undefined' ? row : (typeof r !== 'undefined' ? r : null);
             const targetYear = historyYears[c - 40];
             let bgColor = 'FFA7F3D0'; // Emerald default
             if (targetRow && targetRow.promoYearMap && targetRow.promoYearMap[targetYear]) {
                const pColor = getPromotedBgColorCode(targetRow.promoYearMap[targetYear]);
                if (pColor) bgColor = 'FF' + pColor.replace('#', '').toUpperCase();
             }
             cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
             if (targetRow && targetRow.changeIndexes && targetRow.changeIndexes.includes(c - 1)) {"""

parts3 = code.split(t3)
if len(parts3) == 3:
    code = parts3[0] + r3 + parts3[1] + r3 + parts3[2]
    print("Fill logic replaced!")
else:
    print(f"Could not find exactly 2 occurrences of t3! Found {len(parts3)-1}")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)