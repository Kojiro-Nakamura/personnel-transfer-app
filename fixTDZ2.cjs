const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

const stateStr = `  const [localEmps, setLocalEmps] = useState([]); 
  const [localDepts, setLocalDepts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set()); 
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); 
  const [importData, setImportData] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');`;

if (content.includes(stateStr)) {
  content = content.replace(stateStr + '\n\n', '');
  content = content.replace(
    'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {\n',
    'export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {\n' + stateStr + '\n'
  );
  fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
  console.log('Fixed TDZ error successfully!');
} else {
  console.log('Not found exactly.');
}
