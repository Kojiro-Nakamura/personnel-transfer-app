import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

# 1. addPlanSheet
search1 = """      const topB = rn === 4 && i !== 17 ? 'thick' : false;
      let bottomB = rn === 5 && i !== 17 ? 'thick' : false;"""

replace1 = """      let topB = rn === 4 && i !== 17 ? 'thick' : false;
      if (rn === 5 && [16, 18, 19, 20].includes(i)) topB = 'thick';
      let bottomB = rn === 5 && i !== 17 ? 'thick' : false;"""

# 2. addSimplePlanSheet
search2 = """        const topB = rn === 4 ? 'thick' : false;
        let bottomB = rn === 5 ? 'thick' : false;"""

replace2 = """        let topB = rn === 4 ? 'thick' : false;
        if (rn === 5 && [14, 15, 16].includes(c)) topB = 'thick';
        let bottomB = rn === 5 ? 'thick' : false;"""

if search1 in code:
    code = code.replace(search1, replace1)
    print("Replaced addPlanSheet")
else:
    print("Could not find addPlanSheet search block")

if search2 in code:
    code = code.replace(search2, replace2)
    print("Replaced addSimplePlanSheet")
else:
    print("Could not find addSimplePlanSheet search block")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)

print("Done")