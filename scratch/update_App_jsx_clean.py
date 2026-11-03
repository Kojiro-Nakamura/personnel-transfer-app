import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """      <PartialImportConfirmModal isOpen={modals.partialImportConfirm?.isOpen} data={modals.partialImportConfirm?.data} updates={modals.partialImportConfirm?.data || []} onClose={() => closeModal('partialImportConfirm')} onConfirm={(updates) => { mutations.bulkProcessEmployees(updates); closeModal('partialImportConfirm'); alert(`${updates.length}件のデータを上書きしました。`); }} />"""

t_replace = """      <PartialImportConfirmModal isOpen={modals.partialImportConfirm?.isOpen} data={modals.partialImportConfirm?.data} updates={modals.partialImportConfirm?.data || []} onClose={() => closeModal('partialImportConfirm')} onConfirm={(updates) => { 
        const cleanUpdates = updates.map(u => ({ id: u.id, note: u.note, desiredAssignment: u.desiredAssignment, specialCircumstances: u.specialCircumstances }));
        mutations.bulkProcessEmployees(cleanUpdates); 
        closeModal('partialImportConfirm'); 
        alert(`${updates.length}件のデータを上書きしました。`); 
      }} />"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Modal confirm cleaned.")
else:
    print("Could not find insertion point!")