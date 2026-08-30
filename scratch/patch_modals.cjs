const fs = require('fs');
let code = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// Add FileOpenModal
const fileOpenModalCode = `
export const FileOpenModal = ({ isOpen, onClose, onLoadFile, onLoadData, onListSnapshots, onDeleteSnapshot }) => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && onListSnapshots) {
      setLoading(true);
      onListSnapshots().then(data => {
        setSnapshots(data || []);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [isOpen, onListSnapshots]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl border-t-4 border-[#0F828C] flex flex-col max-h-[80vh]">
        <h3 className="text-lg font-bold text-[#320A6B] mb-4 flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#0F828C]" />
          ファイルを開く
        </h3>
        
        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          <h4 className="font-bold text-sm text-slate-700 mb-2">ブラウザに保存されたデータ</h4>
          {loading ? (
            <div className="text-sm text-slate-500 py-4 text-center">読み込み中...</div>
          ) : snapshots.length === 0 ? (
            <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded border border-slate-200">
              保存されたデータはありません
            </div>
          ) : (
            <div className="space-y-2">
              {snapshots.map(snap => (
                <div key={snap.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-[#0F828C] transition-colors group">
                  <div className="flex flex-col flex-1 min-w-0 mr-4 cursor-pointer" onClick={() => { onLoadData(snap.data, snap.name); onClose(); }}>
                    <div className="font-bold text-sm text-slate-800 truncate">{snap.name}</div>
                    <div className="text-xs text-slate-500">{new Date(snap.timestamp).toLocaleString()}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("このデータを削除してもよろしいですか？")) {
                        onDeleteSnapshot(snap.id).then(() => {
                          setSnapshots(prev => prev.filter(s => s.id !== snap.id));
                        });
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 flex items-center justify-between">
          <div>
            <input 
              type="file" 
              accept=".json" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => { onLoadFile(e); onClose(); }} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              端末からファイルを選択...
            </button>
          </div>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm rounded transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
`;

if (!code.includes("export const FileOpenModal")) {
  code = code + "\n" + fileOpenModalCode;
  fs.writeFileSync('src/components/modals/Modals.jsx', code, 'utf8');
  console.log("Added FileOpenModal to Modals.jsx");
} else {
  console.log("FileOpenModal already exists");
}