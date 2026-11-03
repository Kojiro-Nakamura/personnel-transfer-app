import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """             const newNote = imp.note !== undefined ? imp.note : match.note;
             const newDesiredAssignment = imp.desiredAssignment !== undefined ? imp.desiredAssignment : match.desiredAssignment;
             const newSpecialCircumstances = imp.specialCircumstances !== undefined ? imp.specialCircumstances : match.specialCircumstances;"""

t_replace = """             const newNote = imp.note !== undefined ? imp.note : "";
             const newDesiredAssignment = imp.desiredAssignment !== undefined ? imp.desiredAssignment : "";
             const newSpecialCircumstances = imp.specialCircumstances !== undefined ? imp.specialCircumstances : "";"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("handlePartialImport fallback fixed!")
else:
    print("Could not find the target text!")