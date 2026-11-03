import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """           if (match) {
             updates.push({
               id: match.id,
               note: imp.note !== undefined ? imp.note : match.note,
               desiredAssignment: imp.desiredAssignment !== undefined ? imp.desiredAssignment : match.desiredAssignment,
               specialCircumstances: imp.specialCircumstances !== undefined ? imp.specialCircumstances : match.specialCircumstances,
             });
             matchCount++;
           }"""

t_replace = """           if (match) {
             const newNote = imp.note !== undefined ? imp.note : match.note;
             const newDesiredAssignment = imp.desiredAssignment !== undefined ? imp.desiredAssignment : match.desiredAssignment;
             const newSpecialCircumstances = imp.specialCircumstances !== undefined ? imp.specialCircumstances : match.specialCircumstances;
             
             if (newNote !== match.note || newDesiredAssignment !== match.desiredAssignment || newSpecialCircumstances !== match.specialCircumstances) {
               updates.push({
                 id: match.id,
                 name: match.name,
                 employeeNumber: match.employeeNumber,
                 old: {
                   note: match.note || '',
                   desiredAssignment: match.desiredAssignment || '',
                   specialCircumstances: match.specialCircumstances || ''
                 },
                 new: {
                   note: newNote || '',
                   desiredAssignment: newDesiredAssignment || '',
                   specialCircumstances: newSpecialCircumstances || ''
                 },
                 // For mutations.bulkProcessEmployees to use:
                 note: newNote,
                 desiredAssignment: newDesiredAssignment,
                 specialCircumstances: newSpecialCircumstances,
               });
               matchCount++;
             }
           }"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("handlePartialImport updated with diff!")
else:
    print("Could not find the target text!")