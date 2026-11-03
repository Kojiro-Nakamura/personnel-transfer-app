import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

# Add import
if "PartialImportConfirmModal" not in code:
    code = code.replace(
        "import { ValidationModal } from './components/modals/ValidationModal.jsx';",
        "import { ValidationModal } from './components/modals/ValidationModal.jsx';\nimport { PartialImportConfirmModal } from './components/modals/PartialImportConfirmModal.jsx';"
    )

# Render modal
t_search = """      <ValidationModal isOpen={modals.validation.isOpen} onClose={() => closeModal('validation')} employees={employees} departments={departments} targetYear={targetYear} onEmpClick={(empId) => { const emp = employees.find(e => e.id === empId); if (emp) openModal('emp', emp); }} onAutoFix={(newEmps) => mutations.updateAllEmployees(newEmps)} />"""

t_insert = """      <ValidationModal isOpen={modals.validation.isOpen} onClose={() => closeModal('validation')} employees={employees} departments={departments} targetYear={targetYear} onEmpClick={(empId) => { const emp = employees.find(e => e.id === empId); if (emp) openModal('emp', emp); }} onAutoFix={(newEmps) => mutations.updateAllEmployees(newEmps)} />
      <PartialImportConfirmModal isOpen={modals.partialImportConfirm?.isOpen} data={modals.partialImportConfirm?.data} updates={modals.partialImportConfirm?.data || []} onClose={() => closeModal('partialImportConfirm')} onConfirm={(updates) => { mutations.bulkProcessEmployees(updates); closeModal('partialImportConfirm'); alert(`${updates.length}件のデータを上書きしました。`); }} />"""

if t_search in code:
    code = code.replace(t_search, t_insert)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("Modal injected.")
else:
    print("Could not find insertion point for modal!")