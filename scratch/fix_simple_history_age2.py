import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_simple_history_age = """        } else {
           if (extEmp.history) {
             const h = extEmp.history.find(x => x.year === y);
             if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
           }
        }
        rowVals[34 + i] = historyStr;"""

replace_simple_history_age = """        } else {
           if (extEmp.history) {
             const h = extEmp.history.find(x => x.year === y);
             if (h) historyStr = h.department ? h.department + (h.title ? ' / ' + h.title : '') : (h.title || '');
           }
        }
        if (historyStr && historyStr !== ' / 課直轄' && historyStr !== '未配置' && historyStr !== '-') {
           const histAge = (extEmp.birthDate && !isNaN(y)) ? calculateAge(extEmp.birthDate, y) : null;
           if (histAge !== null && !isNaN(histAge)) {
              historyStr = `${historyStr} (${histAge}歳)`;
           }
        }
        rowVals[34 + i] = historyStr;"""

if search_simple_history_age in code:
    code = code.replace(search_simple_history_age, replace_simple_history_age)
    print("Fixed addSimplePlanSheet history age")
else:
    print("Could not find addSimplePlanSheet history age search block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)