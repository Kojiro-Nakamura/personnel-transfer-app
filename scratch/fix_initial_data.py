import re
with open("src/constants/initialData.js", "r", encoding="utf8") as f:
    code = f.read()

code = code.replace(
    'note: "",',
    'note: "", desiredAssignment: "", specialCircumstances: "",'
)

with open("src/constants/initialData.js", "w", encoding="utf8") as f:
    f.write(code)
print("INITIAL_EMPLOYEES updated!")