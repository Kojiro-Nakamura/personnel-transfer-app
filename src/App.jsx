import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, AlertTriangle,
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, MessageSquare, MessageSquareText, FileCode, GitMerge
} from 'lucide-react';
import { generateAndDownloadHTML } from './utils/exportHtml.js';
import { exportListToExcel, exportUnifiedExcel } from './utils/exportExcel.js';
import { useApp, AppProvider } from './contexts/AppContext.jsx';
import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName, getEraFormattedYear } from './utils/helpers.js';
import { GRADE_OPTIONS, STORAGE_KEY, GRADE_LEVELS } from './constants/config.js';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from './constants/initialData.js';
import { validateEmployees, autoFixEmployees } from './utils/validation.js';


import { CommentButton, FormInput, FormInputWithList, FormSelect, PlacementSelector } from './components/ui/CommonUI.jsx';
import { EmployeeCell, EmployeeRow, EmployeeFormSection, EmployeeModal } from './components/employee/EmployeeComponents.jsx';
import { AddSlotRow, DepartmentBlock } from './components/department/DepartmentComponents.jsx';
import { SidebarCard, AppSidebar } from './components/layout/AppSidebar.jsx';
import { NoteEditModal, EmployeeSelectModal, FileSaveModal, NameEditModal, DeleteConfirmModal, TitleChangeConfirmModal, BulkEditModal } from './components/modals/Modals.jsx';
import { ValidationModal } from './components/modals/ValidationModal.jsx';
import { ChainTransferModal } from './components/modals/ChainTransferModal.jsx';
import { NewWindowPortal } from './components/common/NewWindowPortal.jsx';
export const AppContent = () => {
  const { 
    zoom, departments, selectedEmp, employees, currentFileName, cancelSelection, setZoom, filterLevel, setFilterLevel, 
    undo, redo, canUndo, canRedo, handleRollOver, activePlanId, plans, openModal, mutations, modals, closeModal, 
    targetYear, setTargetYear, switchPlan, duplicatePlan, deletePlan, updatePlanName, expandAll, collapseAll, 
    exportToJSON, exportToHTML, exportToExcel, exportUnifiedExcelBtn, exportModalExcelBtn, loadJSON, handleCellClick, handleAssign, notes 
  } = useApp();
  
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        loadJSON(file);
      }
    }
  }, [loadJSON]);

  const actZoom = zoom * 0.9; 
  const regDepts = departments.filter(d => d.type === 'regular'); 
  const selEmp = selectedEmp ? employees.find(e => e.id === selectedEmp.id) : null;
  
  const currentSummary = useMemo(() => generateGradeSummary(employees, false), [employees]);
  const nextSummary = useMemo(() => generateGradeSummary(employees, true), [employees]);

  useEffect(() => { 
    document.title = "人事異動案作成アプリ"; 
    document.documentElement.lang = "ja"; 
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedEmp) {
        cancelSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedEmp, cancelSelection]);

  const baseFileName = useMemo(() => { 
    const d = new Date(); 
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}_${getEraFormattedYear(targetYear)}人事異動案_ver1`; 
  }, [targetYear]);

  const filterName = Object.keys(GRADE_LEVELS).find(key => GRADE_LEVELS[key] === filterLevel);
  const filterSuffix = filterLevel > 0 && filterName ? `(${filterName}以上)` : '';

  return (
    <div 
      className="min-h-screen bg-slate-200 flex flex-col font-sans text-black selection-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {isDragging && (
        <div className="absolute inset-0 bg-sky-500/20 backdrop-blur-sm z-[999] flex items-center justify-center border-8 border-sky-500 border-dashed m-2 rounded-xl pointer-events-none transition-all">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in duration-200">
            <DownloadCloud className="w-16 h-16 text-sky-500" />
            <h2 className="text-2xl font-bold text-sky-700">JSONファイルをドロップして読み込み</h2>
          </div>
        </div>
      )}

      {/* 画面上部ヘッダー（操作パネル） */}
      <header id="app-header" className="bg-[#3972ac] text-white shadow-md z-20 sticky top-0 border-b border-[#2d5f91]">
        <div className="flex justify-between items-center p-2 border-b border-[#4d86c2]">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-white" />
            <div className="flex items-center bg-white/20 border border-white/30 rounded overflow-hidden p-1">
              <input type="number" value={targetYear} onChange={(e) => setTargetYear(Number(e.target.value))} className="w-20 bg-transparent text-center text-sm font-bold text-white outline-none always-show-spinners" title="対象年度" />
            </div>
            <h1 className="text-base font-bold text-white">年度(R{targetYear - 2018})人事異動案</h1>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center bg-white/10 border border-white/20 rounded overflow-hidden mr-1">
              <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="縮小"><ZoomOut className="w-4 h-4"/></button>
              <span className="text-xs font-bold w-10 text-center text-white" title="現在の表示倍率">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-white/20 text-white transition-colors" title="拡大"><ZoomIn className="w-4 h-4"/></button>
            </div>
            
            <div className="flex gap-0.5">
              <button onClick={undo} disabled={!canUndo} className="p-1.5 bg-white/10 hover:bg-white/20 text-white disabled:bg-white/5 active:scale-95 transition-all disabled:opacity-50 rounded" title="直前の操作を取り消す(元に戻す)"><Undo className="w-4 h-4"/></button>
              <button onClick={redo} disabled={!canRedo} className="p-1.5 bg-white/10 hover:bg-white/20 text-white disabled:bg-white/5 active:scale-95 transition-all disabled:opacity-50 rounded" title="取り消した操作をやり直す"><Redo className="w-4 h-4"/></button>
            </div>
            <button onClick={() => {
                const { fixes } = autoFixEmployees(employees, targetYear);
                const warnings = validateEmployees(employees, targetYear);
                if (fixes.length === 0 && warnings.length === 0) {
                  alert('矛盾チェックを実行しましたが、自動修正が必要な箇所や警告は見つかりませんでした。\n全てのデータは正常です。');
                } else {
                  openModal('validation');
                }
            }} className="bg-yellow-500/30 hover:bg-yellow-500/50 border border-yellow-300 text-yellow-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="職員データの矛盾（昇進年度や経過年数など）をチェックする"><AlertTriangle className="w-4 h-4 mr-1" />矛盾チェック</button>
            <button onClick={() => openModal('chainTransfer')} className="bg-fuchsia-500/30 hover:bg-fuchsia-500/50 border border-fuchsia-300 text-fuchsia-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="玉突き異動表（つなぎ表）を表示する"><GitMerge className="w-4 h-4 mr-1" />つなぎ表</button>
            <button onClick={() => openModal('saveFile', { type: 'org', defaultName: currentFileName ? currentFileName.replace('.json', '') + '_人事異動案' + filterSuffix : baseFileName + '_人事異動案' + filterSuffix, options: [{ label: 'Excel (.xlsx)', value: 'excel', ext: '.xlsx' }, { label: 'HTML (.html)', value: 'html', ext: '.html' }], showCountToggle: true, defaultShowCount: true })} className="bg-emerald-500/30 hover:emerald-500/50 border border-emerald-300 text-emerald-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の人事異動案をファイルとして保存する"><Table className="w-4 h-4 mr-1" />人事異動案</button>
            <button onClick={() => openModal('saveFile', { type: 'list', defaultName: currentFileName ? currentFileName.replace('.json', '') + '_職員一覧' : baseFileName + '_職員一覧', options: [{ label: 'Excel (.xlsx)', value: 'excel', ext: '.xlsx' }, { label: 'HTML (.html)', value: 'html', ext: '.html' }] })} className="bg-emerald-500/30 hover:bg-emerald-500/50 border border-emerald-300 text-emerald-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在の職員一覧をファイルとして保存する"><FileCode className="w-4 h-4 mr-1" />職員一覧</button>
            <button onClick={() => openModal('saveFile', { type: 'json', defaultName: currentFileName ? currentFileName.replace('.json', '') : baseFileName })} className="bg-cyan-500/30 hover:bg-cyan-500/50 border border-cyan-300 text-cyan-50 active:scale-95 transition-all px-3 py-1.5 rounded flex items-center justify-center text-xs font-bold" title="現在のデータをJSONファイルとして保存する"><DownloadCloud className="w-4 h-4 mr-1" />保存</button>
            <label className="bg-slate-400/30 hover:bg-slate-400/50 border border-slate-300 text-slate-50 active:scale-95 transition-all px-3 py-1.5 rounded cursor-pointer flex items-center justify-center text-xs font-bold shadow-sm" title="保存したJSONファイルを読み込む"><FolderOpen className="w-4 h-4 mr-1" />開く<input type="file" accept=".json" onChange={loadJSON} className="hidden" /></label>
          </div>
        </div>
        <div className="flex justify-between items-center bg-[#3972ac] px-2 pt-2 border-b border-[#2d5f91]">
          <div className="flex gap-1 overflow-x-auto items-center">
            {plans.map(p => (
              <div key={p.id} onClick={() => switchPlan(p.id)} className={cx("group relative flex items-center gap-1.5 px-4 py-2 rounded-t-lg text-sm font-bold cursor-pointer transition-colors max-w-[200px]", p.id === activePlanId ? "bg-slate-200 text-[#3972ac] shadow-sm z-10" : "bg-transparent text-white/70 hover:bg-white/10")} title="この案を表示する">
                <span className="truncate flex-1" title={p.name}>{p.name}</span>
                {p.id === activePlanId && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); openModal('planName', p.name); }} title="案の名前を変更する" className="hover:text-[#5f8cc5] transition-colors"><Edit2 className="w-3 h-3" /></button>
                    {plans.length > 1 && <button onClick={(e) => { e.stopPropagation(); deletePlan(p.id); }} title="この案を削除する" className="hover:text-rose-500 transition-colors"><X className="w-3 h-3" /></button>}
                  </div>
                )}
              </div>
            ))}
            <button onClick={duplicatePlan} className="flex items-center gap-1 px-4 py-2 text-white/80 hover:text-white text-sm font-bold transition-colors" title="現在の案を複製して別案を作成する"><Copy className="w-4 h-4" /> 複製</button>
            {currentFileName && <div className="flex items-center ml-2 px-3 py-1 bg-white/20 text-white shadow-sm rounded-full text-[11px] select-none"><FileText className="w-3 h-3 mr-1" />{currentFileName}</div>}
          </div>
          <div className="flex gap-2 pb-1.5 items-center">
            <div className="flex gap-0.5 items-center mr-1">
              <button onClick={expandAll} className="p-1.5 bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all rounded" title="すべての部署を展開する"><ChevronsDown className="w-4 h-4"/></button>
              <button onClick={collapseAll} className="p-1.5 bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all rounded" title="すべての部署を折りたたむ"><ChevronsUp className="w-4 h-4"/></button>
            </div>
                        <div className="flex items-center gap-1.5 mr-2">
              <Filter className="w-4 h-4 text-white" />
              <select 
                value={filterLevel} 
                onChange={e => setFilterLevel(Number(e.target.value))} 
                className={cx("text-xs py-1 px-2 rounded outline-none font-bold cursor-pointer transition-colors border", filterLevel > 0 ? "text-slate-900 border-transparent shadow-inner" : "bg-white/20 hover:bg-white/30 text-white border-transparent transition-all")}
                style={filterLevel > 0 && filterName ? { backgroundColor: getPromotedBgColorCode(filterName) } : {}}
                title="表示する職員の条件を切り替える"
              >
                <option value={0} className="text-black">全件表示</option>
                {GRADE_OPTIONS.filter(g => g !== "").map(g => (
                  <option key={g} value={GRADE_LEVELS[g]} className="text-black">{g}以上</option>
                ))}
              </select>
            </div>
            <button onClick={() => openModal('dept')} className="bg-sky-500/30 hover:bg-sky-500/50 border border-sky-300 text-sky-50 active:scale-95 transition-all px-3 py-1 rounded text-xs font-bold" title="新しい部署を追加する">部署+</button>
            <button onClick={() => openModal('emp')} className="bg-fuchsia-500/30 hover:bg-fuchsia-500/50 border border-fuchsia-300 text-fuchsia-50 active:scale-95 transition-all px-3 py-1 rounded text-xs font-bold" title="新しい職員を追加する">職員+</button>
            <button onClick={() => openModal('bulkEdit')} className="bg-amber-500/30 hover:bg-amber-500/50 border border-amber-300 text-amber-50 active:scale-95 transition-all px-3 py-1 rounded text-xs font-bold" title="職員データの一括編集やCSVファイルの読み込みを行う">職員一括編集</button>
            <button onClick={() => openModal('rollOver')} className="bg-rose-500/40 hover:bg-rose-500/60 border border-rose-300 text-rose-50 active:scale-95 transition-all px-3 py-1 rounded text-xs font-bold ml-2" title="来年度の配置を今年度に確定し、新しい年度へ移行する">次年度移行</button>
          </div>
        </div>
      </header>

      {/* メイン画面（表エリア） */}
      <div id="app-main" className="flex-1 overflow-hidden relative w-full">
        <main className="absolute top-0 left-0 p-2 flex" style={{ transform: actZoom !== 1 ? `scale(${actZoom})` : 'none', transformOrigin: 'top left', width: `${100/actZoom}%`, height: `${100/actZoom}%` }}>
          <div className="flex flex-col md:flex-row gap-2 w-full h-full">
            <div className="flex-1 w-full bg-white rounded shadow-sm border border-slate-400 flex flex-col h-full overflow-hidden">
            <div className={cx("overflow-y-auto flex-1 transition-[padding]", selectedEmp ? "pb-36" : "pb-4")}>
              <div className="flex bg-slate-100 border-b-2 border-slate-400 font-bold text-xs sticky top-0 z-30 shrink-0 shadow-sm">
                <div className="w-[140px] p-2 border-r flex items-center justify-center text-slate-600">配置先</div>
                <div className="flex-1 p-2 text-center border-r bg-slate-200/50 flex flex-col justify-center">
                  <div>今年度（現行）{getEraFormattedYear(targetYear - 1)}</div>
                  <div className="text-[10px] font-normal text-slate-900 mt-0.5">{currentSummary}</div>
                </div>
                <div className="flex-1 p-2 text-[#065084] text-center bg-blue-100/50 flex flex-col justify-center">
                  <div>来年度（新組織）{getEraFormattedYear(targetYear)}</div>
                  <div className="text-[10px] font-normal text-blue-950 mt-0.5">{nextSummary}</div>
                </div>
                <div className="w-[40px] border-l border-slate-500 flex items-center justify-center bg-slate-200 text-[10px] text-slate-600">メモ</div>
              </div>
              {regDepts.map((d, i) => (
                <DepartmentBlock 
                  key={d.id} dept={d} 
                  onMoveUp={i > 0 ? () => mutations.moveDepartment(d.id, 'up') : undefined} 
                  onMoveDown={i < regDepts.length - 1 ? () => mutations.moveDepartment(d.id, 'down') : undefined} 
                />
              ))}
            </div>
          </div>
          <AppSidebar />
        </div>
      </main>
      </div>
      
      {/* 職員をつかんでいる時のフローティングバー */}
      {selectedEmp && selEmp && (() => {
        const ys = selEmp.currentYears;
        const sk = (selEmp.currentSkills || []).join('、');
        const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
        const noteText = selEmp.currentEmploymentType;
        const dispTitle = selEmp.currentTitle || '新採';
        const dispGrade = selEmp.currentGrade;
        const dispAge = calculateAge(selEmp.birthDate, targetYear - 1);

        const hireY = selEmp.hireDate ? parseInt(String(selEmp.hireDate).substring(0, 4)) : null;
        const timeline = [];
        if (hireY) {
          const milestones = [
            { label: '主査', year: selEmp.promoYearChief },
            { label: '主任', year: selEmp.promoYearAssistant1 },
            { label: '班長', year: selEmp.promoYearAssistant2 },
            { label: '補佐III', year: selEmp.promoYearAssistant3 },
            { label: '課長', year: selEmp.promoYearSecHead },
            { label: '所属長', year: selEmp.promoYearDivHead },
            { label: '次長', year: selEmp.promoYearDeputyHead },
            { label: '部長', year: selEmp.promoYearDeptHead },
          ].filter(m => m.year && !isNaN(parseInt(m.year))).sort((a, b) => parseInt(a.year) - parseInt(b.year));
          
          let prevY = hireY;
          let prevLabel = '採用';
          
          if (milestones.length > 0) {
            timeline.push({ label: '採用', isNode: true });
            milestones.forEach(m => {
              const y = parseInt(m.year);
              const diff = y - prevY;
              timeline.push({ label: diff + '年', isNode: false });
              timeline.push({ label: m.label, isNode: true });
              prevY = y;
            });
          }
        }

        
        return (
          <div id="app-floating-bar" className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0F828C] text-white px-6 py-4 rounded-xl shadow-2xl z-[150] flex flex-col gap-3 border-2 border-white min-w-[480px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-200" />
                <span className="font-bold text-sm text-slate-50">配置先の枠をクリックしてください</span>
              </div>
              <button 
                onClick={cancelSelection} 
                className="bg-white text-[#0F828C] hover:bg-slate-100 px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow" 
                title="職員の選択をキャンセルする"
              >
                キャンセル
              </button>
            </div>
            <div className="bg-white text-slate-900 rounded px-3 py-2 flex items-center gap-3 shadow-inner">
              <div className="w-14 truncate text-[11px] text-black" title={dispTitle}>{dispTitle}</div>
              <div className="flex-1 truncate text-sm font-bold text-[#065084]" title={selEmp.name}>{selEmp.name}</div>
              <div className="w-20 truncate text-[11px] text-black text-center" title={dispGrade}>{dispGrade}</div>
              <div className="w-10 text-[12px] text-black text-right" title={`${dispAge}歳`}>{dispAge !== '' ? `${dispAge}歳` : ''}</div>
              <div className={cx("w-20 text-[12px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-black")} title={yd}>{yd}</div>
              <div className="w-24 truncate text-[11px] text-slate-900 text-left shrink-0 ml-1" title={noteText}>{noteText}</div>
            </div>
          </div>
        );
      })()}

      {/* モーダル群の配置 */}
      <NoteEditModal isOpen={modals.note.isOpen} onClose={() => closeModal('note')} onSave={text => mutations.setNote(modals.note.data?.targetId, text)} data={modals.note.data} />
      <EmployeeSelectModal isOpen={modals.empSelect.isOpen} onClose={() => closeModal('empSelect')} onSelect={(empId, placement) => handleAssign(empId, placement)} targetPlacement={modals.empSelect.data} employees={employees} departments={departments} />
      <TitleChangeConfirmModal isOpen={modals.titleChangeConfirm.isOpen} onClose={() => closeModal('titleChangeConfirm')} onConfirm={(empId, newTitle) => mutations.updateEmployee(empId, { nextTitle: newTitle })} data={modals.titleChangeConfirm.data} />
      <EmployeeModal isOpen={modals.emp.isOpen} initialData={modals.emp.data} departments={departments} onClose={() => closeModal('emp')} onSave={modals.emp.data ? d => mutations.updateEmployee(modals.emp.data.id, d) : mutations.addEmployee} />
      <BulkEditModal isOpen={modals.bulkEdit.isOpen} onClose={() => closeModal('bulkEdit')} employees={employees} departments={departments} targetYear={targetYear} onSave={(u, d, a, ud) => { if (ud) mutations.updateAllDepartments(ud); mutations.bulkProcessEmployees(u, d, a); closeModal('bulkEdit'); }} />
      <NameEditModal isOpen={modals.dept.isOpen} title="部署編集" data={modals.dept.data} onClose={() => closeModal('dept')} onSave={d => modals.dept.data ? mutations.updateDepartment(modals.dept.data.id, d) : mutations.addDepartment(d)} />
      <NameEditModal isOpen={modals.post.isOpen} title="ポスト編集" data={modals.post.data?.post} onClose={() => closeModal('post')} onSave={d => modals.post.data?.post ? mutations.updatePost(modals.post.data.deptId, modals.post.data.post.id, d) : mutations.addPost(modals.post.data.deptId, d)} />
      <NameEditModal isOpen={modals.group.isOpen} title="班編集" data={modals.group.data?.group} onClose={() => closeModal('group')} onSave={d => modals.group.data?.group ? mutations.updateGroup(modals.group.data.deptId, modals.group.data.group.id, d) : mutations.addGroup(modals.group.data.deptId, d)} />
      <NameEditModal isOpen={modals.groupPost.isOpen} title="班内ポスト編集" data={modals.groupPost.data?.post} onClose={() => closeModal('groupPost')} onSave={d => modals.groupPost.data?.post ? mutations.updateGroupPost(modals.groupPost.data.deptId, modals.groupPost.data.groupId, modals.groupPost.data.post.id, d) : mutations.addGroupPost(modals.groupPost.data.deptId, modals.groupPost.data.groupId, d)} />
      <NameEditModal isOpen={modals.planName.isOpen} title="名前変更" data={{ name: modals.planName.data }} onClose={() => closeModal('planName')} onSave={d => updatePlanName(activePlanId, d.name)} />
      <DeleteConfirmModal isOpen={modals.delConfirm.isOpen} data={modals.delConfirm.data} onClose={() => closeModal('delConfirm')} onConfirm={d => { if (d.type === 'dept') mutations.deleteDepartment(d.id); else if (d.type === 'post') mutations.deletePost(d.deptId, d.id); else if (d.type === 'group') mutations.deleteGroup(d.deptId, d.id); else if (d.type === 'groupPost') mutations.deleteGroupPost(d.deptId, d.groupId, d.id); else if (d.type === 'emp') mutations.deleteEmployee(d.id); }} />
      <FileSaveModal 
        isOpen={modals.saveFile.isOpen} 
        defaultName={modals.saveFile.data?.defaultName} 
        extension={modals.saveFile.data?.type === 'json' ? '.json' : ''} 
        options={modals.saveFile.data?.options} 
        showCountToggle={modals.saveFile.data?.type === 'org'}
        defaultShowCount={filterLevel === 0}
        onClose={() => closeModal('saveFile')} 
        onSave={(fileName, format, showCount) => { 
          if (modals.saveFile.data.type === 'json') exportToJSON(fileName); 
          else if (modals.saveFile.data.type === 'org') { 
            if (format === 'excel') exportToExcel(fileName, showCount); 
            else exportToHTML(fileName, showCount); 
          } 
          else if (modals.saveFile.data.type === 'list') { 
            if (format === 'excel') exportListToExcel(fileName, targetYear, employees, departments); 
            else generateAndDownloadHTML(employees, departments, targetYear, fileName); 
          } 
        }} 
      />
      <ValidationModal isOpen={modals.validation.isOpen} onClose={() => closeModal('validation')} employees={employees} departments={departments} targetYear={targetYear} onEmpClick={(empId) => { const emp = employees.find(e => e.id === empId); if (emp) openModal('emp', emp); }} onAutoFix={(newEmps) => mutations.updateAllEmployees(newEmps)} />
      
      {modals.chainTransfer.isOpen && (
        <ChainTransferModal 
          isOpen={true} 
          onClose={() => closeModal('chainTransfer')} 
          employees={employees} 
          departments={departments} 
          targetYear={targetYear} 
          currentFileName={currentFileName} 
          notes={notes || []} 
          onExportExcel={() => exportModalExcelBtn(
            currentFileName ? currentFileName.replace(/\.[^/.]+$/, "") + '_つなぎ表.xlsx' : '人事異動案_つなぎ表.xlsx'
          )} 
        />
      )}

      {modals.rollOver.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-t-4 border-orange-500">
            <h3 className="text-lg font-bold mb-4">移行確認</h3>
            <p className="text-sm mb-4">来年度案を今年度として確定し、新年度へ移行します。</p>
            <div className="flex gap-3">
              <button 
                onClick={() => closeModal('rollOver')} 
                className="flex-1 bg-slate-200 py-2 rounded font-bold" 
                title="移行を中止して閉じる"
              >
                中止
              </button>
              <button 
                onClick={() => { handleRollOver(); closeModal('rollOver'); }} 
                className="flex-1 bg-orange-500 text-white py-2 rounded font-bold" 
                title="来年度の構成を今年度に確定する"
              >
                実行
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() { 
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}




