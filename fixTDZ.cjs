const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// Move all state declarations to the top of BulkEditModal
const stateRegex = /  const \[localEmps, setLocalEmps\] = useState\(\[\]\); \n  const \[localDepts, setLocalDepts\] = useState\(\[\]\);\n  const \[sortConfig, setSortConfig\] = useState\(\{ key: null, direction: 'asc' \}\);\n  const \[selectedIds, setSelectedIds\] = useState\(new Set\(\)\); \n  const \[deletedIds, setDeletedIds\] = useState\(new Set\(\)\);\n  const \[confirmDeleteOpen, setConfirmDeleteOpen\] = useState\(false\); \n  const \[importData, setImportData\] = useState\(null\); \n  const \[alertMessage, setAlertMessage\] = useState\(''\);/g;

const match = content.match(stateRegex);
if (match) {
  content = content.replace(stateRegex, '');
  content = content.replace(
    'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {\n',
    'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {\n' + match[0] + '\n'
  );
  fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
  console.log('Fixed TDZ error!');
} else {
  console.log('States not found exactly as expected.');
}
