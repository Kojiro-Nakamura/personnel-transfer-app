import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

search_prefix = """      rowVals[22] = extEmp.desiredAssignment ? '・ ' + extEmp.desiredAssignment : '';
      rowVals[23] = extEmp.specialCircumstances ? '※ ' + extEmp.specialCircumstances : '';"""

replace_prefix = """      rowVals[22] = extEmp.desiredAssignment ? '〇' + extEmp.desiredAssignment : '';
      rowVals[23] = extEmp.specialCircumstances ? '●' + extEmp.specialCircumstances : '';"""

if search_prefix in code:
    code = code.replace(search_prefix, replace_prefix)
    print("Fixed data prefix in addSimplePlanSheet")
else:
    print("Could not find data prefix search string in addSimplePlanSheet")

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)