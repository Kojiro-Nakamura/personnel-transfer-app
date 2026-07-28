import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, 
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, MessageSquare, MessageSquareText
} from 'lucide-react';
import { useApp, AppProvider } from '../../contexts/AppContext.jsx';
import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName } from '../../utils/helpers.js';
import { GRADE_OPTIONS, STORAGE_KEY, GRADE_LEVELS } from '../../constants/config.js';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '../../constants/initialData.js';


import { FormInput, FormInputWithList, FormSelect, PlacementSelector } from '../ui/CommonUI.jsx';
import { EmployeeFormSection, EmployeeRow, EmployeeCell } from '../employee/EmployeeComponents.jsx';
export const NoteEditModal = ({ isOpen, onClose, onSave, data }) => {
  const [text, setText] = useState('');
  useEffect(() => { if (isOpen) setText(data?.text || ''); }, [isOpen, data]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-5 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200 border-t-4 border-sky-500">
        <div className="flex items-center gap-2 mb-3 text-sky-600">
          <MessageSquareText className="w-5 h-5" />
          <h3 className="text-base font-bold">コメントを編集</h3>
        </div>
        <textarea 
          value={text} 
          onChange={e => setText(e.target.value)} 
          className="w-full border border-slate-300 rounded p-3 text-sm outline-none focus:ring-2 focus:ring-sky-500 min-h-[120px] resize-y" 
          placeholder="コメントを入力..."
          autoFocus
        />
        <div className="mt-4 flex justify-between items-center">
          {data?.text ? (
            <button 
              onClick={() => { onSave(''); onClose(); }} 
              className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1" 
              title="コメントを削除する"
            >
              <Trash2 className="w-3.5 h-3.5"/>削除
            </button>
          ) : <div></div>}
          <div className="flex gap-2">
            <button 
              onClick={onClose} 
              className="px-4 py-1.5 border rounded text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors" 
              title="変更を破棄して閉じる"
            >
              キャンセル
            </button>
            <button 
              onClick={() => { onSave(text); onClose(); }} 
              className="px-5 py-1.5 bg-sky-500 text-white rounded text-sm font-bold hover:bg-sky-600 transition-colors shadow" 
              title="コメントを保存する"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmployeeSelectModal = ({ isOpen, onClose, onSelect, targetPlacement, employees, departments }) => {
  const { targetYear } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('unassigned');

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setFilterType('unassigned');
    }
  }, [isOpen]);

  if (!isOpen || !targetPlacement) return null;

  const placementName = getPlacementName(
    targetPlacement.dId, 
    targetPlacement.pId, 
    targetPlacement.gId, 
    targetPlacement.gpId, 
    departments
  );

  const filteredEmployees = employees.filter(emp => {
    if (filterType === 'unassigned') {
      if (emp.departmentId !== 'unassigned') return false;
    }
    if (searchQuery) {
      if (!emp.name.includes(searchQuery)) return false;
    }
    return true;
  });

  const getCurrInfo = (emp) => {
    const d = departments.find(x => x.id === emp.currentDeptId);
    if (!d) return '未配置・退職など';
    return `${d.name} ${emp.currentTitle || ''}`.trim();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-200 shrink-0">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2 text-[#320A6B]">
              <UserPlus className="w-6 h-6" />
              <h2 className="text-lg font-bold">配置する職員を選択</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors" title="閉じる">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="inline-flex items-center bg-cyan-50 text-cyan-800 px-3 py-1.5 rounded text-sm font-bold border border-cyan-100">
            配置先: {placementName}
          </div>
        </div>
        
        <div className="p-3 border-b border-slate-200 bg-slate-50 flex gap-3 items-center shrink-0">
          <input 
            type="text" 
            placeholder="名前で検索..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border border-[#0F828C] rounded shadow-sm px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#0F828C]/30 text-sm"
          />
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="border border-slate-300 rounded shadow-sm px-3 py-1.5 outline-none bg-white font-bold text-sm text-slate-700"
          >
            <option value="unassigned">未配置のみ表示</option>
            <option value="all">全職員を表示</option>
          </select>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col bg-white">
          <div className="flex items-center px-4 py-1.5 gap-2 bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-600 shrink-0">
            <div className="w-44">今年度（現行）の配置・職名</div>
            <div className="flex-1">氏名</div>
            <div className="w-16 text-center">級</div>
            <div className="w-10 text-right">年齢</div>
            <div className="w-16 text-right">現年数</div>
            <div className="w-16 text-center">来年度状態</div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredEmployees.length === 0 ? (
              <div className="text-center text-slate-400 py-10 font-bold">該当する職員がいません</div>
            ) : (
              <div className="flex flex-col">
                {filteredEmployees.map(emp => {
                  const isUnassigned = emp.departmentId === 'unassigned';
                  const ys = emp.currentYears;
                  const sk = (emp.currentSkills || []).join('、');
                  const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
                  const age = calculateAge(emp.birthDate, targetYear - 1);
                  
                  return (
                    <div 
                      key={emp.id} 
                      onClick={() => { onSelect(emp.id, targetPlacement); onClose(); }}
                      className="flex items-center px-4 py-2 gap-2 border-b border-slate-100 hover:bg-amber-50 cursor-pointer transition-colors group"
                      title={`${emp.name} をこの枠に配置する`}
                    >
                      <div className="w-44 truncate text-[11px] text-slate-700 group-hover:text-amber-800 transition-colors" title={getCurrInfo(emp)}>
                        {getCurrInfo(emp)}
                      </div>
                      <div className="flex-1 truncate text-[13px] font-bold text-[#065084]" title={emp.name}>
                        {emp.name}
                      </div>
                      <div className="w-16 truncate text-[11px] text-slate-800 text-center">
                        {emp.currentGrade}
                      </div>
                      <div className="w-10 text-[11px] text-slate-800 text-right">
                        {age !== '' ? `${age}歳` : ''}
                      </div>
                      <div className={cx("w-16 text-[11px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-slate-800")} title={yd}>
                        {yd}
                      </div>
                      <div className="w-16 text-center shrink-0">
                        {isUnassigned ? (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-300">未配置</span>
                        ) : (
                          <span className="text-[10px] text-slate-600">配置済</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const FileSaveModal = ({ isOpen, onClose, onSave, defaultName, extension }) => {
  const [fileName, setFileName] = useState('');
  
  useEffect(() => { 
    if (isOpen) { 
      setFileName(defaultName || ''); 
    } 
  }, [isOpen, defaultName]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border-t-4 border-[#0F828C]">
        <h3 className="text-lg font-bold text-[#320A6B] mb-4">保存ファイル名の設定</h3>
        <div className="space-y-4">
          <FormInput 
            label={`ファイル名 (${extension}は自動で付与されます)`} 
            value={fileName} 
            onChange={setFileName} 
            autoFocus 
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { 
              const finalName = fileName.endsWith(extension) ? fileName : `${fileName}${extension}`;
              onSave(finalName); 
              onClose(); 
            }} 
            disabled={!fileName.trim()} 
            className="px-4 py-2 bg-[#0F828C] text-white rounded text-sm font-bold" 
            title="ファイルとして保存する"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export const NameEditModal = ({ isOpen, onClose, onSave, title, data }) => {
  const [name, setName] = useState(''); 
  const [nextName, setNextName] = useState('');
  
  useEffect(() => { 
    if (isOpen) { 
      setName(data?.name || ''); 
      setNextName(data?.nextName || ''); 
    } 
  }, [isOpen, data]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl border-t-4 border-[#0F828C]">
        <h3 className="text-lg font-bold text-[#320A6B] mb-4">{title}</h3>
        <div className="space-y-4">
          <FormInput label="今年度の名称" value={name} onChange={setName} autoFocus />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              来年度の名称 <span className="text-xs text-slate-400">(変更がある場合)</span>
            </label>
            <input 
              type="text" 
              value={nextName} 
              onChange={e => setNextName(e.target.value)} 
              className="w-full border border-slate-300 rounded p-2 text-sm" 
              placeholder="同じなら空欄" 
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { onSave({ name, nextName }); onClose(); }} 
            disabled={!name.trim()} 
            className="px-4 py-2 bg-[#0F828C] text-white rounded text-sm font-bold" 
            title="変更を保存する"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, data }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border-t-4 border-rose-500">
        <div className="flex items-center gap-2 mb-4 text-rose-600">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">削除の確認</h3>
        </div>
        <p className="text-slate-700 text-sm mb-6">
          「<span className="font-bold">{data.title}</span>」を削除しますか？<br/>
          {data.type !== 'emp' && <span className="text-xs text-rose-600">※配置職員は「未配置」に戻ります。</span>}
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded text-sm font-medium" 
            title="キャンセルして閉じる"
          >
            キャンセル
          </button>
          <button 
            onClick={() => { onConfirm(data); onClose(); }} 
            className="px-4 py-2 bg-rose-500 text-white rounded text-sm font-bold" 
            title="完全に削除する"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
};

export const TitleChangeConfirmModal = ({ isOpen, onClose, onConfirm, data }) => {
  if (!isOpen || !data) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[300] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl border-t-4 border-blue-500 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-bold">職名の変更確認</h3>
        </div>
        <p className="text-slate-700 text-sm mb-6 leading-relaxed">
          <span className="font-bold text-[#320A6B]">{data.empName}</span> さんの職名を<br />
          「<span className="font-bold text-slate-500">{data.oldTitle || '(なし)'}</span>」から「<span className="font-bold text-blue-600">{data.newTitle}</span>」に変更しますか？
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border rounded font-bold text-slate-600 hover:bg-slate-50 transition-colors" 
            title="職名はそのままで配置する"
          >
            いいえ
          </button>
          <button 
            onClick={() => { onConfirm(data.empId, data.newTitle); onClose(); }} 
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 transition-colors shadow" 
            title="職名も変更して配置する"
          >
            はい（変更する）
          </button>
        </div>
      </div>
    </div>
  );
};

export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {
  const [localEmps, setLocalEmps] = useState([]); 
  const [localDepts, setLocalDepts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set()); 
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); 
  const [importData, setImportData] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => { 
    if (isOpen) {
      setLocalEmps(employees.map(e => ({ 
        ...e, 
        currentSkillsStr: (e.currentSkills || []).join('、'), 
        nextSkillsStr: (e.nextSkills || []).join('、') 
      })));
      setLocalDepts(JSON.parse(JSON.stringify(departments))); 
      setSortConfig({ key: null, direction: 'asc' }); 
      setSelectedIds(new Set()); 
      setDeletedIds(new Set()); 
      setConfirmDeleteOpen(false); 
      setImportData(null); 
      setAlertMessage('');
    } else {
      setLocalEmps([]);
    }
  }, [isOpen, employees, departments]);

  const sortedEmps = useMemo(() => {
    let items = [...localEmps];
    if (sortConfig.key) {
      items.sort((a, b) => {
        let av = a[sortConfig.key] || ''; 
        let bv = b[sortConfig.key] || '';
        if (sortConfig.key.includes('Years')) { 
          av = Number(av); 
          bv = Number(bv); 
        }
        if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
        if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [localEmps, sortConfig]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外"
    ].join(',');
    const sampleRow = "000001,和歌山 太郎,S60.01.01,和歌山大学,H20.04.01,特になし,森林整備課,緑化推進班,班長,班長,補佐級II(班長),1,1,,技術職,森林整備課,緑化推進班,班長,班長,補佐級II(班長),2,1+1,,技術職";
    const content = "\uFEFF" + headers + "\n" + sampleRow + "\n";
    downloadFile(content, 'text/csv;charset=utf-8;', '職員一括編集_ひな型.csv');
  };

  const handleExportCSV = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外"
    ];
    const dMap = new Map(localDepts.map(d => [d.id, d]));
    
    const rows = sortedEmps.map(emp => {
      let cDName = '', cPName = '', cGpName = '';
      const cDept = dMap.get(emp.currentDeptId);
      if (cDept) {
        cDName = cDept.name;
        if (emp.currentPostId) {
          const pst = (cDept.posts || []).find(p => p.id === emp.currentPostId);
          if (pst) cPName = pst.name;
        } else if (emp.currentGroupId) {
          const grp = (cDept.groups || []).find(g => g.id === emp.currentGroupId);
          if (grp) {
            cPName = grp.name;
            if (emp.currentGroupPostId) {
              const gpst = (grp.posts || []).find(p => p.id === emp.currentGroupPostId);
              if (gpst) cGpName = gpst.name;
            }
          }
        }
      }

      let nDName = '', nPName = '', nGpName = '';
      const nDept = dMap.get(emp.departmentId);
      if (nDept) {
        nDName = nDept.name;
        if (emp.postId) {
          const pst = (nDept.posts || []).find(p => p.id === emp.postId);
          if (pst) nPName = pst.name;
        } else if (emp.groupId) {
          const grp = (nDept.groups || []).find(g => g.id === emp.groupId);
          if (grp) {
            nPName = grp.name;
            if (emp.groupPostId) {
              const gpst = (grp.posts || []).find(p => p.id === emp.groupPostId);
              if (gpst) nGpName = gpst.name;
            }
          }
        }
      }
      
      const row = [
        emp.employeeNumber || '',
        emp.name || '',
        emp.birthDate || '',
        emp.education || '',
        emp.hireDate || '',
        emp.note || '',
        cDName,
        cPName,
        cGpName,
        emp.currentTitle || '',
        emp.currentGrade || '',
        emp.currentYears || 0,
        emp.currentSkillsStr || '',
        emp.currentEmploymentType || '',
        emp.currentExclude || '',
        nDName,
        nPName,
        nGpName,
        emp.nextTitle || '',
        emp.nextGrade || '',
        emp.nextYears || 0,
        emp.nextSkillsStr || '',
        emp.nextEmploymentType || '',
        emp.nextExclude || '',
        emp.promoYearChief || '',
        emp.promoYearAssistant1 || '',
        emp.promoYearAssistant2 || '',
        emp.promoYearAssistant3 || '',
        emp.promoYearSecHead || '',
        emp.promoYearDivHead || '',
        emp.promoYearDeputyHead || '',
        emp.promoYearDeptHead || ''
      ];
      return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',');
    });
    
    const content = "\uFEFF" + headers.join(',') + "\n" + rows.join("\n");
    downloadFile(content, 'text/csv;charset=utf-8;', '職員一括編集_データ.csv');
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0]; 
    if (!file) return; 
    const target = e.target;
    
    try {
      const buffer = await file.arrayBuffer(); 
      let text = '';
      try { 
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer); 
      } catch { 
        text = new TextDecoder('shift_jis').decode(buffer); 
      }
      
      const lines = text.replace(/^\uFEFF/, '').split(/\r\n|\n/).filter(line => line.trim() !== '');
      if (lines.length <= 1) { 
        setAlertMessage('データが空です。'); 
        return; 
      }
      
      const nDepts = [...localDepts]; 
      const dMap = new Map(nDepts.map(d => [d.name, d])); 
      const adds = []; 
      const updates = [];
      const existingEmpMap = new Map(localEmps.filter(e => e.employeeNumber).map(e => [e.employeeNumber, e]));
      const existingEmpNameMap = new Map(localEmps.map(e => [e.name, e]));
      const genId = (p) => `${p}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const parsePlacement = (dName, pName, gPName) => {
        let dId = 'unassigned', pId = null, gId = null, gpId = null;
        if (dName) {
          let dept = dMap.get(dName); 
          if (!dept) { 
            dept = { id: genId('dept'), name: dName, type: 'regular', posts: [], groups: [] }; 
            dMap.set(dName, dept); 
            nDepts.push(dept); 
          }
          dId = dept.id;
          if (pName) {
            const isG = gPName || /(班|Ｇ|G|グループ|室|部|試験地|センター|チーム|大学校)$/.test(pName);
            if (isG) {
              let grp = (dept.groups || []).find(g => g.name === pName); 
              if (!grp) { 
                grp = { id: genId('grp'), name: pName, posts: [] }; 
                dept.groups = dept.groups || []; 
                dept.groups.push(grp); 
              }
              gId = grp.id;
              if (gPName) { 
                let gp = (grp.posts || []).find(p => p.name === gPName); 
                if (!gp) { 
                  gp = { id: genId('gpost'), name: gPName }; 
                  grp.posts = grp.posts || []; 
                  grp.posts.push(gp); 
                } 
                gpId = gp.id; 
              }
            } else {
              let pst = (dept.posts || []).find(p => p.name === pName); 
              if (!pst) { 
                pst = { id: genId('post'), name: pName }; 
                dept.posts = dept.posts || []; 
                dept.posts.push(pst); 
              } 
              pId = pst.id;
            }
          }
        }
        return { dId, pId, gId, gpId };
      };

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVRow(lines[i]); 
        if (cols.length < 13) continue;
        
        const [empNum, empName, bStr, edu, hStr, note, cDName, cPName, cGPName, cTitle, cGrade, cYsStr, cSkStr, cNote, cExclude] = cols;
        if (!empName) continue;
        
        const currP = parsePlacement(cDName, cPName, cGPName);
        let nextP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
        let nTitle = cTitle, nGrade = cGrade, nYsStr = '1', nSkStr = '', nNote = '', nExclude = '';
        
        if (cols.length >= 24) {
          const [,,,,,,,,,,,,,,, nDName, nPName, nGPName, nxTitle, nxGrade, nxYsStr, nxSkStr, nxNote, nxExclude] = cols;
          nTitle = nxTitle || ''; 
          nGrade = nxGrade || ''; 
          nYsStr = nxYsStr || '1'; 
          nSkStr = nxSkStr || ''; 
          nNote = nxNote || ''; 
          nExclude = nxExclude || '';
          nextP = parsePlacement(nDName, nPName, nGPName);
        }

        let targetEmp = existingEmpMap.get(empNum);
        if (!targetEmp) targetEmp = existingEmpNameMap.get(empName);

        const newEmpData = {
          employeeNumber: empNum || '', 
          name: empName, 
          birthDate: parseJapaneseDate(bStr), 
          education: edu || '', 
          hireDate: parseJapaneseDate(hStr), 
          note: note || '', 
          currentDeptId: currP.dId, 
          currentPostId: currP.pId, 
          currentGroupId: currP.gId, 
          currentGroupPostId: currP.gpId, 
          currentTitle: cTitle || '', 
          currentGrade: cGrade || '', 
          currentYears: parseInt(cYsStr, 10) || 0, 
          currentSkillsStr: cSkStr || '', 
          currentEmploymentType: cNote || '', 
          currentExclude: cExclude || '', 
          departmentId: nextP.dId, 
          postId: nextP.pId, 
          groupId: nextP.gId, 
          groupPostId: nextP.gpId, 
          nextTitle: nTitle, 
          nextGrade: nGrade, 
          nextYears: parseInt(nYsStr, 10) || 1, 
          nextSkillsStr: nSkStr, 
          nextEmploymentType: nNote, 
          nextExclude: nExclude, 
        };

        if (targetEmp) {
          updates.push({ ...targetEmp, ...newEmpData });
        } else {
          adds.push({ 
            ...newEmpData,
            id: genId('new-emp'), 
            orderCurrent: Date.now()+i, 
            orderNext: Date.now()+i, 
            isNew: true 
          });
        }
      }
      
      if (adds.length > 0 || updates.length > 0) {
        setImportData({ additions: adds, updates: updates, depts: nDepts }); 
      } else {
        setAlertMessage('読み込める職員が見つかりません。');
      }
    } catch(err) { 
      setAlertMessage('読み込みエラー: ' + err.message); 
    } finally { 
      target.value = ''; 
    }
  };

  const handleSave = () => {
    const ps = (s) => (s || '').split(',').reduce((a, x) => a.concat(x.split('、')), []).map(x => x.trim()).filter(Boolean);
    const updates = []; 
    const additions = [];
    
    localEmps.forEach(e => {
      const copy = { 
        ...e, 
        currentYears: Number(e.currentYears), 
        nextYears: Number(e.nextYears), 
        currentSkills: ps(e.currentSkillsStr), 
        nextSkills: ps(e.nextSkillsStr) 
      };
      delete copy.currentSkillsStr; 
      delete copy.nextSkillsStr;
      
      if (copy.isNew) { 
        delete copy.isNew; 
        copy.id = copy.id.replace('new-', 'emp-'); 
        additions.push(copy); 
      } else {
        updates.push(copy);
      }
    });
    
    onSave(updates, Array.from(deletedIds), additions, localDepts);
  };

  const inputCls = "w-full h-full border-none bg-transparent outline-none focus:ring-1 focus:ring-inset focus:ring-[#0F828C] px-2 py-1.5 text-[11px] placeholder:text-slate-400";
  
  const Th = ({ label, sortKey, className }) => (
    <th 
      onClick={() => { 
        let dir = 'asc'; 
        if (sortConfig.key === sortKey && sortConfig.direction === 'asc') dir = 'desc'; 
        setSortConfig({ key: sortKey, direction: dir }); 
      }} 
      className={cx(className, "cursor-pointer hover:brightness-95 transition-all select-none group/th relative")} 
      title={`「${label}」で並び替える`}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={cx("text-[10px]", sortConfig.key === sortKey ? "opacity-100 text-[#0F828C]" : "opacity-0 group-hover/th:opacity-30")}>
          {sortConfig.key === sortKey ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▲'}
        </span>
      </div>
    </th>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-4 max-w-[98vw] w-full shadow-xl border-t-4 border-[#0F828C] max-h-[98vh] flex flex-col relative overflow-hidden">
        
        {/* エラーメッセージ */}
        {alertMessage && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-rose-500 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">エラー</h4>
              </div>
              <p className="text-sm mb-6">{alertMessage}</p>
              <div className="flex justify-end">
                <button onClick={() => setAlertMessage('')} className="px-4 py-2 bg-slate-200 rounded font-bold" title="閉じる">閉じる</button>
              </div>
            </div>
          </div>
        )}
        
        {/* CSVインポート確認 */}
        {importData && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-[#0F828C] max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-[#0F828C]">
                <FolderOpen className="w-6 h-6" />
                <h4 className="font-bold text-lg">CSV読込確認</h4>
              </div>
              <p className="text-sm mb-6 leading-relaxed">
                {importData.updates.length > 0 && <span>既存の職員 <strong>{importData.updates.length}</strong> 名を更新します。<br/></span>}
                {importData.additions.length > 0 && <span>新しい職員 <strong>{importData.additions.length}</strong> 名を追加します。<br/></span>}
                よろしいですか？
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setImportData(null)} className="px-4 py-2 border rounded font-bold" title="キャンセルして閉じる">キャンセル</button>
                <button 
                  onClick={() => { 
                    setLocalDepts(importData.depts); 
                    setLocalEmps(prev => {
                      const updMap = new Map(importData.updates.map(u => [u.id, u]));
                      const next = prev.map(e => updMap.has(e.id) ? updMap.get(e.id) : e);
                      return [...importData.additions, ...next];
                    });
                    setImportData(null); 
                  }} 
                  className="px-4 py-2 bg-[#0F828C] text-white rounded font-bold" 
                  title="読み込んだデータを反映する"
                >
                  反映する
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 削除確認 */}
        {confirmDeleteOpen && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center z-[300] backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-xl border-t-4 border-rose-500 max-w-sm w-full">
              <div className="flex items-center gap-2 mb-4 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h4 className="font-bold text-lg">削除の確認</h4>
              </div>
              <p className="text-sm mb-6">
                選択した {selectedIds.size} 名を削除しますか？<br/>
                <span className="text-xs text-slate-500">（保存するまで確定しません）</span>
              </p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConfirmDeleteOpen(false)} className="px-4 py-2 border rounded font-bold" title="キャンセルして閉じる">キャンセル</button>
                <button 
                  onClick={() => { 
                    setDeletedIds(prev => new Set([...prev, ...selectedIds])); 
                    setLocalEmps(prev => prev.filter(e => !selectedIds.has(e.id))); 
                    setSelectedIds(new Set()); 
                    setConfirmDeleteOpen(false); 
                  }} 
                  className="px-4 py-2 bg-rose-500 text-white rounded font-bold" 
                  title="選択した職員を完全に削除する"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ヘッダーツールバー */}
        <div className="flex justify-between items-center mb-3 border-b pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-[#0F828C]" />
            <h3 className="text-base font-bold">職員一括編集</h3>
            <button 
              onClick={() => { 
                setLocalEmps(prev => [{ 
                  id: `new-emp-${Date.now()}`, 
                  employeeNumber: '', name: '', birthDate: '', education: '', hireDate: '', note: '', 
                  currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null, 
                  currentTitle: '', currentGrade: '', currentYears: 0, currentSkillsStr: '', currentEmploymentType: '', currentExclude: '', 
                  departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null, 
                  nextTitle: '', nextGrade: '', nextYears: 1, nextSkillsStr: '', nextEmploymentType: '', nextExclude: '', 
                  orderCurrent: Date.now(), orderNext: Date.now(), isNew: true 
                }, ...prev]); 
              }} 
              className="ml-4 px-3 py-1 bg-sky-100 text-sky-700 rounded text-xs font-bold" 
              title="一覧の一番上に新しい職員の行を追加します"
            >
              職員追加
            </button>
            <label className="ml-2 px-3 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold cursor-pointer" title="CSVファイルから職員データをまとめて追加します">
              CSV読込<input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
            </label>
            <button 
              onClick={handleExportCSV} 
              className="ml-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-bold flex items-center gap-1 border border-indigo-200 hover:bg-indigo-200 transition-colors" 
              title="現在の編集内容をCSV形式で保存します"
            >
              <DownloadCloud className="w-3.5 h-3.5" />CSV保存
            </button>
            <button 
              onClick={handleDownloadTemplate} 
              className="ml-2 px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold flex items-center gap-1 border border-slate-300 hover:bg-slate-200 transition-colors" 
              title="インポート用のCSVひな型をダウンロードします"
            >
              <DownloadCloud className="w-3.5 h-3.5" />ひな型DL
            </button>
            {selectedIds.size > 0 && (
              <button 
                onClick={() => setConfirmDeleteOpen(true)} 
                className="ml-2 px-3 py-1 bg-rose-100 text-rose-700 rounded text-xs font-bold transition-colors" 
                title="チェックを入れた職員を一覧から削除します"
              >
                選択削除
              </button>
            )}
          </div>
          <button onClick={onClose} title="閉じる"><X className="w-4 h-4" /></button>
        </div>
        
        {/* テーブルエリア */}
        <div className="overflow-auto flex-1 border border-slate-300 rounded shadow-inner">
          <table className="w-full text-[11px] whitespace-nowrap min-w-max border-collapse">
            <thead className="bg-slate-100 sticky top-0 z-20">
              <tr>
                <th className="px-2 py-1 border-b border-slate-300 bg-slate-200 sticky left-0 z-40 w-8 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"></th>
                <th className="px-2 py-1 border-b border-r-2 border-slate-300 bg-slate-200 sticky left-8 z-30 min-w-[8rem] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] text-center text-slate-800">氏名</th>
                <th colSpan="5" className="px-2 py-1 border-b border-r text-center bg-slate-200 text-slate-700">基本情報</th>
                <th colSpan="7" className="px-2 py-1 border-b border-r text-center bg-slate-100 text-slate-700">今年度</th>
                <th colSpan="7" className="px-2 py-1 border-b border-r text-center bg-blue-100/50 text-[#065084]">来年度</th><th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>
              </tr>
              <tr>
                <th className="px-2 py-1 border-b border-slate-300 bg-slate-200 sticky left-0 z-40 text-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" title="すべて選択/解除">
                  <input 
                    type="checkbox" 
                    checked={sortedEmps.length > 0 && selectedIds.size === sortedEmps.length} 
                    onChange={(e) => { 
                      if (e.target.checked) setSelectedIds(new Set(sortedEmps.map(emp => emp.id))); 
                      else setSelectedIds(new Set()); 
                    }} 
                    className="cursor-pointer" 
                  />
                </th>
                <Th label="氏名" sortKey="name" className="px-2 py-1 border-b border-r-2 border-slate-300 bg-slate-200 sticky left-8 z-30 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)] text-left" />
                <Th label="職員番号" sortKey="employeeNumber" className="border-r" />
                <Th label="生年月日" sortKey="birthDate" className="border-r" />
                <Th label="最終学歴" sortKey="education" className="border-r" />
                <Th label="採用年月日" sortKey="hireDate" className="border-r" />
                <Th label="特記事項" sortKey="note" className="border-r" />
                <Th label="配置先" sortKey="currentDeptId" className="bg-slate-100 border-r" />
                <Th label="職名" sortKey="currentTitle" className="bg-slate-100 border-r" />
                <Th label="級" sortKey="currentGrade" className="bg-slate-100 border-r" />
                <Th label="年数" sortKey="currentYears" className="bg-slate-100 border-r" />
                <Th label="詳細" sortKey="currentSkillsStr" className="bg-slate-100 border-r" />
                <Th label="備考" sortKey="currentEmploymentType" className="bg-slate-100 border-r" />
                <Th label="カウント除外" sortKey="currentExclude" className="bg-slate-100 border-r" />
                <Th label="配置先" sortKey="departmentId" className="bg-blue-50/50 border-r" />
                <Th label="職名" sortKey="nextTitle" className="bg-blue-50/50 border-r" />
                <Th label="級" sortKey="nextGrade" className="bg-blue-50/50 border-r" />
                <Th label="年数" sortKey="nextYears" className="bg-blue-50/50 border-r" />
                <Th label="詳細" sortKey="nextSkillsStr" className="bg-blue-50/50 border-r" />
                <Th label="備考" sortKey="nextEmploymentType" className="bg-blue-50/50 border-r" />
                <Th label="カウント除外" sortKey="nextExclude" className="bg-blue-50/50 border-r" />

                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />

              </tr>
            </thead>
            <tbody>
              {sortedEmps.map(emp => {
                const isS = selectedIds.has(emp.id);
                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));
                
                return (
                  <tr key={emp.id} className={cx("border-b h-8 transition-colors group", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white hover:bg-slate-50")}>
                    <td className={cx("sticky left-0 z-20 text-center border-r border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white group-hover:bg-slate-50")} title="選択する">
                      <input 
                        type="checkbox" 
                        checked={isS} 
                        onChange={(e) => { 
                          const n = new Set(selectedIds); 
                          if (e.target.checked) n.add(emp.id); 
                          else n.delete(emp.id); 
                          setSelectedIds(n); 
                        }} 
                        className="cursor-pointer" 
                      />
                    </td>
                    <td className={cx("sticky left-8 z-10 border-r-2 border-slate-300 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.2)]", isS ? "bg-emerald-50" : emp.isNew ? "bg-sky-50" : "bg-white group-hover:bg-slate-50")}>
                      <input type="text" value={emp.name||''} onChange={e => handleChange(emp.id,'name',e.target.value)} className={cx(inputCls, "font-bold text-slate-800")} />
                    </td>
                    <td><input type="text" value={emp.employeeNumber||''} onChange={e => handleChange(emp.id,'employeeNumber',e.target.value)} className={inputCls} /></td>
                    <td><input type="date" value={emp.birthDate||''} onChange={e => handleChange(emp.id,'birthDate',e.target.value)} className={inputCls} /></td>
                    <td><input type="text" value={emp.education||''} onChange={e => handleChange(emp.id,'education',e.target.value)} className={inputCls} /></td>
                    <td><input type="date" value={emp.hireDate||''} onChange={e => handleChange(emp.id,'hireDate',e.target.value)} className={inputCls} /></td>
                    <td className="border-r relative group/input">
                      <input type="text" value={emp.note||''} onChange={e => handleChange(emp.id,'note',e.target.value)} className={inputCls} />
                      {emp.note && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[200px] bg-slate-800 text-white text-[11px] p-2 rounded shadow-lg opacity-0 group-hover/input:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-pre-wrap break-words">
                          {emp.note}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                        </div>
                      )}
                    </td>
                    <td className="bg-slate-50/30 p-1">
                      <PlacementSelector 
                        className="h-[26px] gap-1" 
                        deptId={emp.currentDeptId} postId={emp.currentPostId} groupId={emp.currentGroupId} groupPostId={emp.currentGroupPostId} 
                        departments={localDepts} isNext={false} 
                        onChange={v => setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, currentDeptId: v.deptId, currentPostId: v.postId, currentGroupId: v.groupId, currentGroupPostId: v.groupPostId } : e))} 
                      />
                    </td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentTitle||''} onChange={e => handleChange(emp.id,'currentTitle',e.target.value)} className={inputCls} /></td>
                    <td className="bg-slate-50/30">
                      <select value={emp.currentGrade||''} onChange={e => handleChange(emp.id,'currentGrade',e.target.value)} className={inputCls}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-slate-50/30"><input type="number" value={emp.currentYears||0} onChange={e => handleChange(emp.id,'currentYears',e.target.value)} className={inputCls} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentSkillsStr||''} onChange={e => handleChange(emp.id,'currentSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={inputCls} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentEmploymentType||''} onChange={e => handleChange(emp.id,'currentEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={inputCls} /></td>
                    <td className="bg-slate-50/30 border-r"><input type="text" list="exclude-list-bulk" value={emp.currentExclude||''} onChange={e => handleChange(emp.id,'currentExclude',e.target.value)} placeholder="事務職など" className={inputCls} /></td>
                    <td className="bg-blue-50/30 p-1">
                      <PlacementSelector 
                        className="h-[26px] gap-1" 
                        deptId={emp.departmentId} postId={emp.postId} groupId={emp.groupId} groupPostId={emp.groupPostId} 
                        departments={localDepts} isNext={true} 
                        onChange={v => setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, departmentId: v.deptId, postId: v.postId, groupId: v.groupId, groupPostId: v.groupPostId } : e))} 
                      />
                    </td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextTitle||''} onChange={e => handleChange(emp.id,'nextTitle',e.target.value)} className={inputCls} /></td>
                    <td className="bg-blue-50/30">
                      <select value={emp.nextGrade||''} onChange={e => handleChange(emp.id,'nextGrade',e.target.value)} className={inputCls}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-blue-50/30"><input type="number" value={emp.nextYears||0} onChange={e => handleChange(emp.id,'nextYears',e.target.value)} className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextSkillsStr||''} onChange={e => handleChange(emp.id,'nextSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextEmploymentType||''} onChange={e => handleChange(emp.id,'nextEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={inputCls} /></td>
                    <td className="bg-blue-50/30"><input type="text" list="exclude-list-bulk" value={emp.nextExclude||''} onChange={e => handleChange(emp.id,'nextExclude',e.target.value)} placeholder="事務職など" className={inputCls} /></td>

                    <td className="bg-fuchsia-50/30 border-l"><input type="number" value={emp.promoYearChief||''} onChange={e => handleChange(emp.id,'promoYearChief',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant1||''} onChange={e => handleChange(emp.id,'promoYearAssistant1',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant2||''} onChange={e => handleChange(emp.id,'promoYearAssistant2',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant3||''} onChange={e => handleChange(emp.id,'promoYearAssistant3',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearSecHead||''} onChange={e => handleChange(emp.id,'promoYearSecHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDivHead||''} onChange={e => handleChange(emp.id,'promoYearDivHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeputyHead||''} onChange={e => handleChange(emp.id,'promoYearDeputyHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={inputCls} /></td>

                  </tr>
                );
              })}
            </tbody>
          </table>
          <datalist id="exclude-list-bulk">
            {["事務職", "技術職", "短時間"].map(o => <option key={o} value={o} />)}
          </datalist>
        </div>
        
        {/* フッター */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center shrink-0">
          <div className="text-[11px] text-slate-500">
            全 {localEmps.length} 名
            {deletedIds.size > 0 && <span className="ml-3 text-rose-500 font-bold">（うち {deletedIds.size} 名削除予定）</span>}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-1.5 border rounded text-sm" title="変更を破棄して閉じる">キャンセル</button>
            <button onClick={handleSave} className="px-5 py-1.5 bg-[#0F828C] text-white rounded text-sm font-bold" title="すべての変更を保存して閉じる">一括保存</button>
          </div>
        </div>
        
      </div>
    </div>
  );
};


