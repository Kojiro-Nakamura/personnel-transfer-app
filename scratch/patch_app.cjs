const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// Import FileOpenModal
if (!code.includes("FileOpenModal")) {
  code = code.replace(
    "import { NoteEditModal, EmployeeSelectModal, FileSaveModal, NameEditModal, DeleteConfirmModal, TitleChangeConfirmModal, BulkEditModal }",
    "import { NoteEditModal, EmployeeSelectModal, FileSaveModal, FileOpenModal, NameEditModal, DeleteConfirmModal, TitleChangeConfirmModal, BulkEditModal }"
  );
}

// Add state for FileOpenModal
if (!code.includes("openFile:")) {
  code = code.replace(
    "saveFile: { isOpen: false, data: null },",
    "saveFile: { isOpen: false, data: null },\n    openFile: { isOpen: false, data: null },"
  );
}

// Import indexedDB functions
if (!code.includes("getSnapshots")) {
  code = "import { getSnapshots, deleteSnapshot } from './utils/indexedDB.js';\n" + code;
}

// Replace the "開く" button
const openBtnTarget = `<label className="bg-slate-400/30 hover:bg-slate-400/50 border border-slate-300 text-slate-50 active:scale-95 transition-all px-3 py-1.5 rounded cursor-pointer flex items-center justify-center text-xs font-bold shadow-sm" title="保存したJSONファイルを読み込む"><FolderOpen className="w-4 h-4 mr-1" />開く<input type="file" accept=".json" onChange={loadJSON} className="hidden" /></label>`;
const openBtnReplacement = `<button onClick={() => openModal('openFile')} className="bg-slate-400/30 hover:bg-slate-400/50 border border-slate-300 text-slate-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold shadow-sm" title="保存したデータを読み込む"><FolderOpen className="w-4 h-4 mr-1" />開く</button>`;

if (code.includes(openBtnTarget)) {
  code = code.replace(openBtnTarget, openBtnReplacement);
}

// Render FileOpenModal
const modalTarget = `<FileSaveModal`;
const modalReplacement = `<FileOpenModal
        isOpen={modals.openFile.isOpen}
        onClose={() => closeModal('openFile')}
        onLoadFile={loadJSON}
        onLoadData={(data, fileName) => {
          // AppContext has loadFromData if we exported it, let's use it
          // Wait, AppContext has loadFromData? Let's check how we can access it.
          // loadFromData is not exposed in useApp() yet.
        }}
        onListSnapshots={getSnapshots}
        onDeleteSnapshot={deleteSnapshot}
      />
      <FileSaveModal`;

if (code.includes(modalTarget) && !code.includes("<FileOpenModal")) {
  code = code.replace(modalTarget, modalReplacement);
}

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log("Patched App.jsx");