import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, 
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, FileCode, MessageSquare, MessageSquareText
} from 'lucide-react';
import { useApp, AppProvider } from '../../contexts/AppContext.jsx';
import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getEraFormattedYear, extractYearFromHeader, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName } from '../../utils/helpers.js';
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

export const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments, targetYear }) => {
  const [localEmps, setLocalEmps] = useState([]); 
  const [localDepts, setLocalDepts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedIds, setSelectedIds] = useState(new Set()); 
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false); 
  const [importData, setImportData] = useState(null); 
  const [alertMessage, setAlertMessage] = useState('');
  const historyYears = useMemo(() => {
    let min = new Date().getFullYear();
    let max = min + 1;
    let hasHistory = false;
    
    const allEmps = [...(localEmps || [])];
    if (importData) {
      if (importData.additions) allEmps.push(...importData.additions);
      if (importData.updates) allEmps.push(...importData.updates);
    }
    
    allEmps.forEach(emp => {
      if (emp.history && emp.history.length > 0) {
        hasHistory = true;
        emp.history.forEach(h => {
          if (h.year < min) min = h.year;
          if (h.year > max) max = h.year;
        });
      }
    });
    
    if (targetYear) {
      hasHistory = true;
      if (targetYear < min) min = targetYear;
      if (targetYear > max) max = targetYear;
    }

    if (!hasHistory) {
      min = new Date().getFullYear() - 5;
    }
    
    return Array.from({ length: max - min + 1 }, (_, i) => min + i);
  }, [localEmps, importData]);

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
    } else {
      items.sort((a, b) => {
        const gradeA = getGradeLevel(a.currentGrade);
        const gradeB = getGradeLevel(b.currentGrade);
        if (gradeA !== gradeB) {
          return gradeB - gradeA;
        }
        
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const getYear = (emp) => {
            for (let i = pKeys.length - 1; i >= 0; i--) {
                const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                if (!isNaN(y)) return y;
            }
            return NaN;
        };
        const yA = getYear(a);
        const yB = getYear(b);
        
        if (!isNaN(yA) && !isNaN(yB)) {
            return yA - yB; // Ascending year = Descending tenure
        } else if (!isNaN(yA)) {
            return -1;
        } else if (!isNaN(yB)) {
            return 1;
        }
        return 0;
      });
    }
    return items;
  }, [localEmps, sortConfig]);

  if (!isOpen) return null;


  const handleExportHTML = () => {
    const scriptStr = `
      function sortTable(n) {
        var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
        table = document.getElementById("empTable");
        switching = true;
        dir = "asc";
        while (switching) {
          switching = false;
          rows = table.rows;
          for (i = 2; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            var valX = x ? (x.getAttribute("data-val") || x.innerText).toLowerCase() : "";
            var valY = y ? (y.getAttribute("data-val") || y.innerText).toLowerCase() : "";
            var numX = Number(valX);
            var numY = Number(valY);
            if (!isNaN(numX) && !isNaN(numY) && valX !== "" && valY !== "") {
               valX = numX; valY = numY;
            }
            if (dir == "asc") {
              if (valX > valY) { shouldSwitch = true; break; }
            } else if (dir == "desc") {
              if (valX < valY) { shouldSwitch = true; break; }
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount ++;
          } else {
            if (switchcount == 0 && dir == "asc") {
              dir = "desc";
              switching = true;
            }
          }
        }
      }
    `;

    let html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>職員一括編集 HTML保存</title>
<style>
  body { font-family: sans-serif; font-size: 11px; margin: 20px; color: #334155; }
  table { border-collapse: collapse; width: max-content; }
  th, td { border: 1px solid #cbd5e1; padding: 4px; text-align: center; vertical-align: middle; white-space: nowrap; }
  th { cursor: pointer; user-select: none; }
  th:hover { opacity: 0.8; }
  .sticky-col { position: sticky; left: 0; z-index: 10; background-color: #f1f5f9; box-shadow: 2px 0 5px -2px rgba(0,0,0,0.2); }
  .bg-slate { background-color: #f1f5f9; }
  .bg-blue { background-color: #eff6ff; }
  .bg-fuchsia { background-color: #fdf4ff; }
  .bg-emerald { background-color: #ecfdf5; }
  .text-left { text-align: left; }
  .arrow { color: #64748b; font-size: 10px; margin: 0 2px; }
  .diff-span { font-size: 10px; font-weight: bold; border-radius: 2px; padding: 1px 3px; margin-right: 2px; border: 1px solid; }
  .diff-emerald { color: #059669; background-color: #ecfdf5; border-color: #d1fae5; }
  .diff-blue { color: #2563eb; background-color: #eff6ff; border-color: #bfdbfe; }
</style>
<script>
${scriptStr}
</script>
</head>
<body>
<table id="empTable">
  <thead>
    <tr>
      <th colspan="6" class="bg-slate">基本情報</th>
      <th colspan="7" class="bg-slate">今年度</th>
      <th colspan="7" class="bg-blue">来年度</th>
      <th colspan="10" class="bg-fuchsia">昇進年度 (西暦)</th>
      ${historyYears.length > 0 ? `<th colspan="${historyYears.length}" class="bg-emerald">履歴</th>` : ''}
    </tr>
    <tr>
      <th onclick="sortTable(0)" class="sticky-col text-left" style="min-width: 100px;">氏名</th>
      <th onclick="sortTable(1)" class="bg-slate">職員番号</th>
      <th onclick="sortTable(2)" class="bg-slate">生年月日</th>
      <th onclick="sortTable(3)" class="bg-slate">最終学歴</th>
      <th onclick="sortTable(4)" class="bg-slate">採用年月日</th>
      <th onclick="sortTable(5)" class="bg-slate">特記事項</th>
      <th onclick="sortTable(6)" class="bg-slate">配置先</th>
      <th onclick="sortTable(7)" class="bg-slate">職名</th>
      <th onclick="sortTable(8)" class="bg-slate">級</th>
      <th onclick="sortTable(9)" class="bg-slate">年数</th>
      <th onclick="sortTable(10)" class="bg-slate">詳細</th>
      <th onclick="sortTable(11)" class="bg-slate">備考</th>
      <th onclick="sortTable(12)" class="bg-slate">カウント除外</th>
      <th onclick="sortTable(13)" class="bg-blue">配置先</th>
      <th onclick="sortTable(14)" class="bg-blue">職名</th>
      <th onclick="sortTable(15)" class="bg-blue">級</th>
      <th onclick="sortTable(16)" class="bg-blue">年数</th>
      <th onclick="sortTable(17)" class="bg-blue">詳細</th>
      <th onclick="sortTable(18)" class="bg-blue">備考</th>
      <th onclick="sortTable(19)" class="bg-blue">カウント除外</th>
      <th onclick="sortTable(20)" class="bg-fuchsia" style="width: 56px;">採用</th>
      <th onclick="sortTable(21)" class="bg-fuchsia" style="width: 72px;">係長級(主査)</th>
      <th onclick="sortTable(22)" class="bg-fuchsia" style="width: 72px;">補佐級I(主任)</th>
      <th onclick="sortTable(23)" class="bg-fuchsia" style="width: 72px;">補佐級II(班長)</th>
      <th onclick="sortTable(24)" class="bg-fuchsia" style="width: 72px;">補佐級III</th>
      <th onclick="sortTable(25)" class="bg-fuchsia" style="width: 72px;">課長級</th>
      <th onclick="sortTable(26)" class="bg-fuchsia" style="width: 72px;">所属長級</th>
      <th onclick="sortTable(27)" class="bg-fuchsia" style="width: 72px;">次長級</th>
      <th onclick="sortTable(28)" class="bg-fuchsia" style="width: 72px;">部長級</th>
      <th onclick="sortTable(29)" class="bg-fuchsia" style="width: 56px;">来年度まで</th>
      ${historyYears.map((y, idx) => `<th onclick="sortTable(${30 + idx})" class="bg-emerald" style="width: 60px;">${getEraFormattedYear(y)}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
`;

    const dMap = new Map(localDepts.map(d => [d.id, d]));
    
    sortedEmps.forEach(emp => {
      const getDeptName = (deptId, postId, groupId, groupPostId) => {
        if (!deptId || deptId === 'unassigned' || deptId === 'retired') return '';
        const dept = dMap.get(deptId);
        if (!dept) return '';
        let str = dept.name;
        if (postId) {
          const p = (dept.posts || []).find(p => p.id === postId);
          if (p) str += '（' + p.name + '）';
        } else if (groupId) {
          const g = (dept.groups || []).find(g => g.id === groupId);
          if (g) {
            str += ' ' + g.name;
            if (groupPostId) {
              const gp = (g.posts || []).find(p => p.id === groupPostId);
              if (gp) str += '（' + gp.name + '）';
            }
          }
        }
        return str;
      };

      const cDeptName = getDeptName(emp.currentDeptId, emp.currentPostId, emp.currentGroupId, emp.currentGroupPostId);
      const nDeptName = getDeptName(emp.departmentId, emp.postId, emp.groupId, emp.groupPostId);

      const renderPromo = (key) => {
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        const idx = pKeys.indexOf(key);
        let prevY = NaN;
        if (idx > 0) {
          for (let i = idx - 1; i >= 0; i--) {
            const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
            if (!isNaN(y)) { prevY = y; break; }
          }
        }
        const currentY = parseInt(emp[key] || 'NaN');
        const diff = (!isNaN(prevY) && !isNaN(currentY) && currentY >= prevY) ? currentY - prevY : null;
        
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="diff-span diff-emerald">${diff}年&gt;</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        cellHtml += emp[key] || '';
        return `<td class="bg-fuchsia" data-val="${emp[key]||''}"><div style="display:flex;align-items:center;justify-content:center;">${cellHtml}</div></td>`;
      };

      const renderFinalDiff = () => {
        const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
        let prevY = NaN;
        for (let i = pKeys.length - 1; i >= 0; i--) {
          const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
          if (!isNaN(y)) { prevY = y; break; }
        }
        const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
        let cellHtml = '';
        if (diff !== null) {
          cellHtml += `<span class="arrow">&gt;</span><span class="diff-span diff-blue">${diff >= 0 ? diff : 0}年</span>`;
        } else {
          cellHtml += `<span class="arrow">&gt;</span>`;
        }
        return `<td class="bg-fuchsia" data-val="${diff !== null ? (diff >= 0 ? diff : 0) : ''}"><div style="display:flex;align-items:center;justify-content:flex-start;">${cellHtml}</div></td>`;
      };

      let histHtml = '';
      historyYears.forEach(year => {
        let hStr = '';
        if (year === targetYear) {
          hStr = nDeptName;
        } else {
          const hist = (emp.history || []).find(h => h.year === year);
          hStr = hist ? hist.department : '';
        }
        histHtml += `<td class="bg-emerald" data-val="${hStr}">${hStr}</td>`;
      });

      html += `
    <tr>
      <td class="sticky-col text-left" data-val="${emp.name||''}">${emp.name||''}</td>
      <td class="bg-slate" data-val="${emp.employeeNumber||''}">${emp.employeeNumber||''}</td>
      <td class="bg-slate" data-val="${emp.birthDate||''}">${emp.birthDate||''}</td>
      <td class="bg-slate" data-val="${emp.education||''}">${emp.education||''}</td>
      <td class="bg-slate" data-val="${emp.hireDate||''}">${emp.hireDate||''}</td>
      <td class="bg-slate" data-val="${emp.note||''}">${emp.note||''}</td>
      <td class="bg-slate" data-val="${cDeptName}">${cDeptName}</td>
      <td class="bg-slate" data-val="${emp.currentTitle||''}">${emp.currentTitle||''}</td>
      <td class="bg-slate" data-val="${emp.currentGrade||''}">${emp.currentGrade||''}</td>
      <td class="bg-slate" data-val="${emp.currentYears||0}">${emp.currentYears||''}</td>
      <td class="bg-slate" data-val="${emp.currentSkillsStr||''}">${emp.currentSkillsStr||''}</td>
      <td class="bg-slate" data-val="${emp.currentEmploymentType||''}">${emp.currentEmploymentType||''}</td>
      <td class="bg-slate" data-val="${emp.currentExclude||''}">${emp.currentExclude||''}</td>
      
      <td class="bg-blue" data-val="${nDeptName}">${nDeptName}</td>
      <td class="bg-blue" data-val="${emp.nextTitle||''}">${emp.nextTitle||''}</td>
      <td class="bg-blue" data-val="${emp.nextGrade||''}">${emp.nextGrade||''}</td>
      <td class="bg-blue" data-val="${emp.nextYears||0}">${emp.nextYears||''}</td>
      <td class="bg-blue" data-val="${emp.nextSkillsStr||''}">${emp.nextSkillsStr||''}</td>
      <td class="bg-blue" data-val="${emp.nextEmploymentType||''}">${emp.nextEmploymentType||''}</td>
      <td class="bg-blue" data-val="${emp.nextExclude||''}">${emp.nextExclude||''}</td>
      
      <td class="bg-fuchsia" data-val="${emp.hireDate ? emp.hireDate.substring(0,4) : ''}">${emp.hireDate ? emp.hireDate.substring(0,4) : ''}</td>
      ${renderPromo('promoYearChief')}
      ${renderPromo('promoYearAssistant1')}
      ${renderPromo('promoYearAssistant2')}
      ${renderPromo('promoYearAssistant3')}
      ${renderPromo('promoYearSecHead')}
      ${renderPromo('promoYearDivHead')}
      ${renderPromo('promoYearDeputyHead')}
      ${renderPromo('promoYearDeptHead')}
      ${renderFinalDiff()}
      
      ${histHtml}
    </tr>`;
    });

    html += `
  </tbody>
</table>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `人事異動案_職員一括_${targetYear}年度.html`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDownloadTemplate = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外",
      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級",
      ...historyYears.map(y => getEraFormattedYear(y))
    ].join(',');
    const sampleRow = `000001,和歌山 太郎,S60.01.01,和歌山大学,H20.04.01,特になし,森林整備課,緑化推進班,班長,班長,補佐級II(班長),1,1,,技術職,森林整備課,緑化推進班,班長,班長,補佐級II(班長),2,1+1,,技術職,2015,2018,2022,,,,,` + historyYears.map(y => ',').join('');
    const content = "\uFEFF" + headers + "\n" + sampleRow + "\n";
    downloadFile(content, 'text/csv;charset=utf-8;', '職員一括編集_ひな型.csv');
  };

  const handleExportCSV = () => {
    const headers = [
      "職員番号", "氏名", "生年月日", "最終学歴", "採用年月日", "特記事項", 
      "【今年度】部署名", "【今年度】ポスト・班名", "【今年度】班内ポスト名", "【今年度】職名", "【今年度】級", "【今年度】年数", "【今年度】詳細", "【今年度】備考", "【今年度】カウント除外",
      "【来年度】部署名", "【来年度】ポスト・班名", "【来年度】班内ポスト名", "【来年度】職名", "【来年度】級", "【来年度】年数", "【来年度】詳細", "【来年度】備考", "【来年度】カウント除外",
      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級",
      ...historyYears.map(y => getEraFormattedYear(y))
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
        emp.nextExclude || ''
,
        emp.promoYearChief || '',
        emp.promoYearAssistant1 || '',
        emp.promoYearAssistant2 || '',
        emp.promoYearAssistant3 || '',
        emp.promoYearSecHead || '',
        emp.promoYearDivHead || '',
        emp.promoYearDeputyHead || '',
        emp.promoYearDeptHead || '',
        ...historyYears.map(year => {
          if (year === targetYear) {
              let histStr = '';
              const nDept = dMap.get(emp.departmentId);
              if (nDept && nDept.id !== 'unassigned' && nDept.id !== 'retired') {
                  histStr = nDept.name;
                  if (emp.postId) {
                    const p = (nDept.posts || []).find(p => p.id === emp.postId);
                    if (p) histStr += '（' + p.name + '）';
                  } else if (emp.groupId) {
                    const g = (nDept.groups || []).find(g => g.id === emp.groupId);
                    if (g) {
                      histStr += ' ' + g.name;
                      if (emp.groupPostId) {
                        const gp = (g.posts || []).find(p => p.id === emp.groupPostId);
                        if (gp) histStr += '（' + gp.name + '）';
                      }
                    }
                  }
              }
              return histStr;
          }
          const hist = (emp.history || []).find(h => h.year === year);
          return hist ? hist.department : '';
        })
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
      
      const headerCols = parseCSVRow(lines[0]);
      
      const colMap = new Map();
      headerCols.forEach((col, i) => {
        colMap.set(col.trim(), i);
      });

      const csvYearsMap = new Map();
      for (let k = 0; k < headerCols.length; k++) {
        const year = extractYearFromHeader(headerCols[k]);
        if (year && year >= 1900 && year <= 2100) {
          csvYearsMap.set(k, year);
        }
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
            const isG = gPName || /(課|室|G|グループ|班|係|チーム|センター|チーム長|学生)$/.test(pName);
            if (isG) {
              let grp = dept.groups.find(g => g.name === pName);
              if (!grp) { grp = { id: genId('grp'), name: pName, posts: [] }; dept.groups.push(grp); }
              gId = grp.id;
              if (gPName) {
                let gp = grp.posts.find(p => p.name === gPName);
                if (!gp) { gp = { id: genId('gp'), name: gPName }; grp.posts.push(gp); }
                gpId = gp.id;
              }
            } else {
              let post = dept.posts.find(p => p.name === pName);
              if (!post) { post = { id: genId('post'), name: pName }; dept.posts.push(post); }
              pId = post.id;
            }
          }
        }
        return { dId, pId, gId, gpId };
      };

      const isVerticalFormat = colMap.has('年度') && colMap.has('配属先');

      if (isVerticalFormat) {
        // --- 縦持ち（構造）形式のパース ---
        const empGroups = new Map(); // empNum (or name) -> { empNum, empName, birth, hire, history: [] }

        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length < 2) continue;
          
          const getVal = (key) => {
            const idx = colMap.get(key);
            return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
          };

          const empNum = getVal('職員番号');
          const empName = getVal('氏名');
          if (!empNum && !empName) continue;
          
          const key = empNum || empName;
          if (!empGroups.has(key)) {
            empGroups.set(key, {
              employeeNumber: empNum,
              name: empName,
              birthDate: getVal('生年月日'),
              hireDate: getVal('採用年月日'),
              history: []
            });
          }
          
          const yearStr = getVal('年度');
          const deptName = getVal('配属先');
          if (yearStr && deptName) {
            const y = parseInt(yearStr, 10);
            if (!isNaN(y)) {
              empGroups.get(key).history.push({
                year: y,
                department: deptName
              });
            }
          }
        }

        // empGroupsを回して、既存データとマージ
        let i = 0;
        for (const [key, g] of empGroups.entries()) {
          i++;
          let targetEmp = existingEmpMap.get(g.employeeNumber);
          if (!targetEmp && g.name) targetEmp = existingEmpNameMap.get(g.name);

          const bDate = g.birthDate ? parseJapaneseDate(g.birthDate) : (targetEmp ? targetEmp.birthDate : '');
          const hDate = g.hireDate ? parseJapaneseDate(g.hireDate) : (targetEmp ? targetEmp.hireDate : '');

          g.history.forEach(h => {
            h.age = calculateAge(bDate, h.year);
            h.japaneseYear = getEraFormattedYear(h.year);
          });
          g.history.sort((a, b) => a.year - b.year);

          let newHistory = targetEmp && targetEmp.history ? [...targetEmp.history] : [];
          g.history.forEach(h => {
            const existingIdx = newHistory.findIndex(eh => eh.year === h.year);
            if (existingIdx >= 0) {
              newHistory[existingIdx] = h;
            } else {
              newHistory.push(h);
            }
          });
          newHistory.sort((a, b) => a.year - b.year);

          const newEmpData = {
            employeeNumber: g.employeeNumber !== undefined ? g.employeeNumber : (targetEmp ? targetEmp.employeeNumber : ''), 
            name: g.name !== undefined ? g.name : (targetEmp ? targetEmp.name : ''), 
            birthDate: bDate,
            hireDate: hDate,
            history: newHistory
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
      } else {
        // --- 従来の横持ち（一覧）形式のパース ---
        for (let i = 1; i < lines.length; i++) {
          const cols = parseCSVRow(lines[i]);
          if (cols.length < 2) continue;
          
          const getVal = (key) => {
            const idx = colMap.get(key);
            return idx !== undefined && idx < cols.length ? cols[idx] : undefined;
          };

          const empNum = getVal('職員番号');
          const empName = getVal('氏名');
          if (!empNum && !empName) continue;

          let targetEmp = existingEmpMap.get(empNum);
          if (!targetEmp) targetEmp = existingEmpNameMap.get(empName);

          // 基本情報の取得
          const bStr = getVal('生年月日');
          const hStr = getVal('採用年月日');
          const edu = getVal('最終学歴');
          const note = getVal('特記事項');

          // 今年度情報
          const cDName = getVal('【今年度】部署名');
          const cPName = getVal('【今年度】ポスト・班名');
          const cGPName = getVal('【今年度】班内ポスト名');
          const cTitle = getVal('【今年度】職名');
          const cGrade = getVal('【今年度】級');
          const cYsStr = getVal('【今年度】年数');
          const cSkStr = getVal('【今年度】詳細');
          const cNote = getVal('【今年度】備考');
          const cExclude = getVal('【今年度】カウント除外');

          let currP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
          if (cDName !== undefined || cPName !== undefined || cGPName !== undefined) {
            currP = parsePlacement(cDName, cPName, cGPName);
          } else if (targetEmp) {
            currP = { dId: targetEmp.currentDeptId, pId: targetEmp.currentPostId, gId: targetEmp.currentGroupId, gpId: targetEmp.currentGroupPostId };
          }

          // 来年度情報
          const nDName = getVal('【来年度】部署名');
          const nPName = getVal('【来年度】ポスト・班名');
          const nGPName = getVal('【来年度】班内ポスト名');
          const nTitle = getVal('【来年度】職名');
          const nGrade = getVal('【来年度】級');
          const nYsStr = getVal('【来年度】年数');
          const nSkStr = getVal('【来年度】詳細');
          const nNote = getVal('【来年度】備考');
          const nExclude = getVal('【来年度】カウント除外');

          let nextP = { dId: 'unassigned', pId: null, gId: null, gpId: null };
          if (nDName !== undefined || nPName !== undefined || nGPName !== undefined) {
            nextP = parsePlacement(nDName, nPName, nGPName);
          } else if (targetEmp) {
            nextP = { dId: targetEmp.departmentId, pId: targetEmp.postId, gId: targetEmp.groupId, gpId: targetEmp.groupPostId };
          }

          // 昇進年度
          const pChief = getVal('【昇進年度】係長級(主査)');
          const pAss1 = getVal('【昇進年度】補佐級I(主任)');
          const pAss2 = getVal('【昇進年度】補佐級II(班長)');
          const pAss3 = getVal('【昇進年度】補佐級III');
          const pSec = getVal('【昇進年度】課長級');
          const pDiv = getVal('【昇進年度】所属長級');
          const pDep = getVal('【昇進年度】次長級');
          const pDept = getVal('【昇進年度】部長級');

          const newEmpData = {
            employeeNumber: empNum !== undefined ? empNum : (targetEmp ? targetEmp.employeeNumber : ''), 
            name: empName !== undefined ? empName : (targetEmp ? targetEmp.name : ''), 
            birthDate: bStr !== undefined ? parseJapaneseDate(bStr) : (targetEmp ? targetEmp.birthDate : ''), 
            education: edu !== undefined ? edu : (targetEmp ? targetEmp.education : ''), 
            hireDate: hStr !== undefined ? parseJapaneseDate(hStr) : (targetEmp ? targetEmp.hireDate : ''), 
            note: note !== undefined ? note : (targetEmp ? targetEmp.note : ''), 
            currentDeptId: currP.dId, 
            currentPostId: currP.pId, 
            currentGroupId: currP.gId, 
            currentGroupPostId: currP.gpId, 
            currentTitle: cTitle !== undefined ? cTitle : (targetEmp ? targetEmp.currentTitle : ''), 
            currentGrade: cGrade !== undefined ? cGrade : (targetEmp ? targetEmp.currentGrade : ''), 
            currentYears: cYsStr !== undefined ? (parseInt(cYsStr, 10) || 0) : (targetEmp ? targetEmp.currentYears : 0), 
            currentSkillsStr: cSkStr !== undefined ? cSkStr : (targetEmp ? targetEmp.currentSkillsStr : ''), 
            currentEmploymentType: cNote !== undefined ? cNote : (targetEmp ? targetEmp.currentEmploymentType : ''), 
            currentExclude: cExclude !== undefined ? cExclude : (targetEmp ? targetEmp.currentExclude : ''), 
            departmentId: nextP.dId, 
            postId: nextP.pId, 
            groupId: nextP.gId, 
            groupPostId: nextP.gpId, 
            nextTitle: nTitle !== undefined ? nTitle : (targetEmp ? targetEmp.nextTitle : ''), 
            nextGrade: nGrade !== undefined ? nGrade : (targetEmp ? targetEmp.nextGrade : ''), 
            nextYears: nYsStr !== undefined ? (parseInt(nYsStr, 10) || 1) : (targetEmp ? targetEmp.nextYears : 1), 
            nextSkillsStr: nSkStr !== undefined ? nSkStr : (targetEmp ? targetEmp.nextSkillsStr : ''), 
            nextEmploymentType: nNote !== undefined ? nNote : (targetEmp ? targetEmp.nextEmploymentType : ''), 
            nextExclude: nExclude !== undefined ? nExclude : (targetEmp ? targetEmp.nextExclude : ''), 
            promoYearChief: pChief !== undefined ? pChief : (targetEmp ? targetEmp.promoYearChief : ''),
            promoYearAssistant1: pAss1 !== undefined ? pAss1 : (targetEmp ? targetEmp.promoYearAssistant1 : ''),
            promoYearAssistant2: pAss2 !== undefined ? pAss2 : (targetEmp ? targetEmp.promoYearAssistant2 : ''),
            promoYearAssistant3: pAss3 !== undefined ? pAss3 : (targetEmp ? targetEmp.promoYearAssistant3 : ''),
            promoYearSecHead: pSec !== undefined ? pSec : (targetEmp ? targetEmp.promoYearSecHead : ''),
            promoYearDivHead: pDiv !== undefined ? pDiv : (targetEmp ? targetEmp.promoYearDivHead : ''),
            promoYearDeputyHead: pDep !== undefined ? pDep : (targetEmp ? targetEmp.promoYearDeputyHead : ''),
            promoYearDeptHead: pDept !== undefined ? pDept : (targetEmp ? targetEmp.promoYearDeptHead : ''),
          };

          if (csvYearsMap.size > 0) {
            let newHistory = targetEmp && targetEmp.history ? [...targetEmp.history] : [];
            for (let [k, year] of csvYearsMap.entries()) {
              if (k < cols.length) {
                const deptName = cols[k] || '';
                const age = calculateAge(newEmpData.birthDate, year);
                
                const existingIdx = newHistory.findIndex(h => h.year === year);
                if (deptName) {
                  if (existingIdx >= 0) {
                    newHistory[existingIdx] = { year, japaneseYear: getEraFormattedYear(year), age, department: deptName };
                  } else {
                    newHistory.push({ year, japaneseYear: getEraFormattedYear(year), age, department: deptName });
                  }
                }
              }
            }
            newHistory.sort((a, b) => a.year - b.year);
            newEmpData.history = newHistory;
          } else if (targetEmp && targetEmp.history) {
            newEmpData.history = targetEmp.history;
          } else {
            newEmpData.history = [];
          }

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
              onClick={handleExportHTML} 
              className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold flex items-center gap-1 border border-orange-200 hover:bg-orange-200 transition-colors" 
              title="現在の内容をHTML形式で保存します（閲覧・ソート用）"
            >
              <FileCode className="w-3.5 h-3.5" />HTML保存
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
                <th colSpan="7" className="px-2 py-1 border-b border-r text-center bg-blue-100/50 text-[#065084]">来年度</th>
<th colSpan="10" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>
                {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}
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

                <Th label="採用" sortKey="hireDate" className="bg-fuchsia-50/50 border-l border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />
                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-r w-[72px] min-w-[72px] whitespace-normal leading-tight" />
                <Th label="来年度まで" sortKey="" className="bg-fuchsia-50/50 border-r w-[56px] min-w-[56px] whitespace-normal leading-tight" />
                {historyYears.length > 0 && historyYears.map(year => (
                  <Th key={`hist-h-${year}`} label={getEraFormattedYear(year)} sortKey={`hist_${year}`} className="bg-emerald-50/50 border-l w-14 min-w-[56px] text-[10px]" />
                ))}

              </tr>
            </thead>
            <tbody>
              {sortedEmps.map((emp, empIdx) => {
                const isS = selectedIds.has(emp.id);
                const handleChange = (id, key, val) => setLocalEmps(prev => prev.map(e => e.id === id ? { ...e, [key]: val } : e));

                const getDiff = (emp, currentKey) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  const currentIdx = pKeys.indexOf(currentKey);
                  if (currentIdx <= 0) return null;
                  const currentY = currentKey === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[currentKey] || 'NaN');
                  if (isNaN(currentY)) return null;
                  let prevY = NaN;
                  for (let i = currentIdx - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  if (!isNaN(prevY)) {
                    const diff = currentY - prevY;
                    return diff >= 0 ? diff : 0;
                  }
                  return null;
                };

                const renderPromoCell = (emp, key, isFirst = false) => {
                  const diff = getDiff(emp, key);
                  return (
                    <td key={key} className={cx("bg-fuchsia-50/30 p-0.5 align-middle", isFirst ? "border-l" : "")}>
                      <div className="flex flex-row items-center justify-center gap-0.5 overflow-hidden">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-0.5 rounded-sm border border-emerald-100 shadow-sm shrink-0 leading-none whitespace-nowrap">
                            {diff}年<ChevronRight className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                        <input type="text" value={emp[key]||''} onChange={e => handleChange(emp.id, key, e.target.value)} className={cx(inputCls, 'text-center !px-0 !w-[34px] shrink-0')} />
                      </div>
                    </td>
                  );
                };
                
                const renderFinalDiffCell = (emp) => {
                  const pKeys = ['hireDate', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
                  let prevY = NaN;
                  for (let i = pKeys.length - 1; i >= 0; i--) {
                    const y = pKeys[i] === 'hireDate' ? (emp.hireDate ? parseInt(emp.hireDate.substring(0,4)) : NaN) : parseInt(emp[pKeys[i]] || 'NaN');
                    if (!isNaN(y)) { prevY = y; break; }
                  }
                  const diff = (!isNaN(prevY)) ? targetYear - prevY : null;
                  return (
                    <td className="bg-fuchsia-50/30 p-0.5 align-middle border-r">
                      <div className="flex flex-row items-center justify-start gap-0.5 h-full min-h-[26px] overflow-hidden">
                        {diff !== null && (
                          <div className="flex flex-row items-center text-[10px] font-bold text-blue-600 bg-blue-50 px-1 rounded-sm border border-blue-200 shadow-sm shrink-0 leading-none whitespace-nowrap">
                            <ChevronRight className="w-2.5 h-2.5 text-blue-500" />{diff >= 0 ? diff : 0}年
                          </div>
                        )}
                        {diff === null && <ChevronRight className="w-2.5 h-2.5 text-slate-300 shrink-0" />}
                      </div>
                    </td>
                  );
                };

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
                    <td><input type="text" value={emp.employeeNumber||''} onChange={e => handleChange(emp.id,'employeeNumber',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td><input type="date" value={emp.birthDate||''} onChange={e => handleChange(emp.id,'birthDate',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td><input type="text" value={emp.education||''} onChange={e => handleChange(emp.id,'education',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td><input type="date" value={emp.hireDate||''} onChange={e => handleChange(emp.id,'hireDate',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="border-r relative group/input">
                      <input type="text" value={emp.note||''} onChange={e => handleChange(emp.id,'note',e.target.value)} className={cx(inputCls, 'text-center px-1')} />
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
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentTitle||''} onChange={e => handleChange(emp.id,'currentTitle',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-slate-50/30">
                      <select value={emp.currentGrade||''} onChange={e => handleChange(emp.id,'currentGrade',e.target.value)} className={cx(inputCls, 'text-center px-1')}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-slate-50/30"><input type="number" value={emp.currentYears||0} onChange={e => handleChange(emp.id,'currentYears',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentSkillsStr||''} onChange={e => handleChange(emp.id,'currentSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-slate-50/30"><input type="text" value={emp.currentEmploymentType||''} onChange={e => handleChange(emp.id,'currentEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-slate-50/30 border-r"><input type="text" list="exclude-list-bulk" value={emp.currentExclude||''} onChange={e => handleChange(emp.id,'currentExclude',e.target.value)} placeholder="事務職など" className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-blue-50/30 p-1">
                      <PlacementSelector 
                        className="h-[26px] gap-1" 
                        deptId={emp.departmentId} postId={emp.postId} groupId={emp.groupId} groupPostId={emp.groupPostId} 
                        departments={localDepts} isNext={true} 
                        onChange={v => setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, departmentId: v.deptId, postId: v.postId, groupId: v.groupId, groupPostId: v.groupPostId } : e))} 
                      />
                    </td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextTitle||''} onChange={e => handleChange(emp.id,'nextTitle',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-blue-50/30">
                      <select value={emp.nextGrade||''} onChange={e => handleChange(emp.id,'nextGrade',e.target.value)} className={cx(inputCls, 'text-center px-1')}>
                        {GRADE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td className="bg-blue-50/30"><input type="number" value={emp.nextYears||0} onChange={e => handleChange(emp.id,'nextYears',e.target.value)} className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextSkillsStr||''} onChange={e => handleChange(emp.id,'nextSkillsStr',e.target.value)} placeholder="派1+治1、1+1など" className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-blue-50/30"><input type="text" value={emp.nextEmploymentType||''} onChange={e => handleChange(emp.id,'nextEmploymentType',e.target.value)} placeholder="育代No.1：横山など" className={cx(inputCls, 'text-center px-1')} /></td>
                    <td className="bg-blue-50/30"><input type="text" list="exclude-list-bulk" value={emp.nextExclude||''} onChange={e => handleChange(emp.id,'nextExclude',e.target.value)} placeholder="事務職など" className={cx(inputCls, 'text-center px-1')} /></td>

                    <td className="bg-fuchsia-50/30 p-1 align-middle border-l border-r">
                      <div className="flex items-center justify-center h-full min-h-[26px] text-slate-700 text-xs">
                        {emp.hireDate ? emp.hireDate.substring(0,4) : ''}
                      </div>
                    </td>
                    {renderPromoCell(emp, 'promoYearChief', false)}
                    {renderPromoCell(emp, 'promoYearAssistant1')}
                    {renderPromoCell(emp, 'promoYearAssistant2')}
                    {renderPromoCell(emp, 'promoYearAssistant3')}
                    {renderPromoCell(emp, 'promoYearSecHead')}
                    {renderPromoCell(emp, 'promoYearDivHead')}
                    {renderPromoCell(emp, 'promoYearDeputyHead')}
                    {renderPromoCell(emp, 'promoYearDeptHead')}
                    {renderFinalDiffCell(emp)}
                    {historyYears.length > 0 && historyYears.map((year, yIdx) => {
                      let histStr = '';
                      if (year === targetYear) {
                          const nDept = localDepts.find(d => d.id === emp.departmentId);
                          if (nDept && nDept.id !== 'unassigned' && nDept.id !== 'retired') {
                              histStr = nDept.name;
                              if (emp.postId) {
                                const p = (nDept.posts || []).find(p => p.id === emp.postId);
                                if (p) histStr += '（' + p.name + '）';
                              } else if (emp.groupId) {
                                const g = (nDept.groups || []).find(g => g.id === emp.groupId);
                                if (g) {
                                  histStr += ' ' + g.name;
                                  if (emp.groupPostId) {
                                    const gp = (g.posts || []).find(p => p.id === emp.groupPostId);
                                    if (gp) histStr += '（' + gp.name + '）';
                                  }
                                }
                              }
                          }
                      } else {
                          const hist = (emp.history || []).find(h => h.year === year);
                          histStr = hist ? hist.department : '';
                      }
                      
                      const isBottom = empIdx >= sortedEmps.length - 2;
                      const isRight = yIdx >= historyYears.length - 2;
                      return (
                        <td key={`hist-d-${year}`} className="bg-emerald-50/30 border-l p-1 min-w-[60px] w-[60px] relative group/hist">
                          <input type="text" value={histStr} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center cursor-default"} title="" />
                          {histStr && (
                            <div className={cx(
                                "absolute hidden group-hover/hist:block z-[999] bg-slate-800 text-white text-[11px] rounded py-1 px-2 whitespace-nowrap shadow-xl pointer-events-none",
                                isBottom ? "bottom-full mb-1" : "top-full mt-1",
                                isRight ? "right-0" : "left-1/2 -translate-x-1/2"
                            )}>
                              {histStr}
                              <div className={cx(
                                "absolute border-4 border-transparent",
                                isBottom ? "top-full border-t-slate-800" : "bottom-full border-b-slate-800",
                                isRight ? "right-4" : "left-1/2 -translate-x-1/2"
                              )}></div>
                            </div>
                          )}
                        </td>
                      );
                    })}

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



