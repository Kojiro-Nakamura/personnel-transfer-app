import re

with open("scratch/simple_sheet_orig.js", "r", encoding="utf8") as f:
    code = f.read()

# Rename function
code = code.replace("export const addSimplePlanSheet = ", "export const addCurrentBasePlanSheet = ")

# We want to iterate based on current year's arrangement.
# In the original, the outer loop is:
# departments.forEach((dept) => {
#   let dNamePrinted = false;
#   const currD = deptMap.current[dept.id] || { groups: {} };
#   const nextD = deptMap.next[dept.id] || { groups: {} };
#
# But for addCurrentBasePlanSheet, we want the current arrangement!
# So we use `currD = deptMap.current[dept.id]`, but we should loop over the groups and posts of the CURRENT department!
# Wait, the structure `departments` defines the groups and posts for NEXT year technically, but they are shared unless renamed.
# Actually, the original addPlanSheet loops over `dept.groups` (which is the definition), but the definitions are the same for both years, except `dept.nextName` vs `dept.name`.
# So we can just loop over `dept.groups`.
# But instead of finding `nextEmps` and checking `filterLevel`, we find `currEmps`.

# Let's write the whole function from scratch in python because string replacement will be too messy.