import re

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

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

if t2 in code:
    code = code.replace(t2, r2)
    print("Loop 2 replaced!")
else:
    print("Loop 2 not found!")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)