import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, 
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ArrowRight, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, MessageSquare, MessageSquareText
} from 'lucide-react';
import { useApp, AppProvider } from '../../contexts/AppContext.jsx';
import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName } from '../../utils/helpers.js';
import { GRADE_OPTIONS, STORAGE_KEY, GRADE_LEVELS } from '../../constants/config.js';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '../../constants/initialData.js';


import { CommentButton, FormInput, FormInputWithList, FormSelect, PlacementSelector } from '../ui/CommonUI.jsx';
export const EmployeeCell = ({ emp, isNext, isEmpty, onClick, isPost, moveProps, isConflict, hasPeer }) => {
  const { isPickingMode, targetYear, openModal, mutations, hoveredEmpId, setHoveredEmpId, selectedEmp } = useApp();
  const isSelected = !!(selectedEmp && emp && selectedEmp.id === emp.id);
  
  if (isEmpty || !emp) {
    const emptyTextColor = isNext 
      ? (isPickingMode ? "text-slate-800" : (hasPeer ? "text-blue-500" : "text-slate-400")) 
      : "text-slate-400";

    return (
      <div 
        onClick={isNext ? onClick : undefined} 
        className={cx(
          "flex-1 flex items-center justify-center px-2 py-1 font-bold text-[11px] border-r transition-all border-dashed",
          emptyTextColor,
          isPost ? "border-sky-400" : "border-slate-300",
          isNext 
            ? cx("cursor-pointer", isPickingMode ? "hover:ring-2 hover:ring-inset hover:ring-amber-400 bg-amber-50" : "bg-slate-50/30 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300")
            : "bg-slate-50/30 cursor-default"
        )}
        title={isNext ? (isPickingMode ? "選択中の職員をここに配置します" : "ここへ配置する職員を選択します") : ""}
      >
        {!isNext ? '' : (isPickingMode ? '+ ここに配置' : '+ 職員を選択')}
      </div>
    );
  }
  
  const ys = isNext ? emp.nextYears : emp.currentYears; 
  const sk = (isNext ? emp.nextSkills : emp.currentSkills || []).join('、'); 
  const yd = sk ? `${ys}年(${sk})` : `${ys}年`;
  const age = calculateAge(emp.birthDate, isNext ? targetYear : targetYear - 1);
  const showUnassign = emp && emp.departmentId !== 'unassigned';
  const noteText = isNext ? emp.nextEmploymentType : emp.currentEmploymentType;

  const isFutureUnassigned = !isNext && emp.departmentId === 'unassigned';
  const isFutureRetired = !isNext && emp.departmentId === 'retired';

  const defaultBorder = isPost ? "border-sky-400" : "border-slate-300";
  const defaultBg = isPost ? (isNext ? "bg-sky-200/50" : "bg-sky-100/50") : (isNext ? "bg-blue-50/10" : "bg-white");

  const borderClass = isConflict 
    ? "border-2 border-rose-500 z-10 shadow-[0_0_5px_rgba(225,29,72,0.4)]" 
    : isFutureUnassigned 
      ? "border-[3px] border-dashed border-orange-400" 
      : isFutureRetired 
        ? "border-[3px] border-dotted border-slate-800" 
        : `border-r ${defaultBorder}`;
        
  const bgClass = isConflict 
    ? "bg-rose-50/90" 
    : isFutureUnassigned 
      ? "bg-orange-50/80" 
      : isFutureRetired 
        ? "bg-slate-100/80" 
        : defaultBg;

  const isPromoted = isNext && emp && isPromotedGrade(emp.currentGrade, emp.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(emp.nextGrade) : "";

  const cellClasses = cx(
    "flex-1 flex items-center px-2 py-1 gap-2 transition-all relative group/emp duration-200 cursor-pointer",
    borderClass,
    isSelected ? "ring-2 ring-inset ring-[#0F828C] bg-[#0F828C]/10 z-10" : 
    isPickingMode && isNext ? "hover:ring-2 hover:ring-inset hover:ring-amber-500 bg-amber-50 z-10" : 
    emp.id === hoveredEmpId ? "bg-yellow-200 z-20 shadow-md transform -translate-y-0.5" : 
    bgClass
  );

  return (
    <div 
      onClick={(!isNext && isPickingMode && !isSelected) ? undefined : onClick} 
      onMouseEnter={() => setHoveredEmpId(emp.id)} 
      onMouseLeave={() => setHoveredEmpId(null)} 
      className={cellClasses} 
      title={isPickingMode && isNext ? "選択中の職員をここに配置します" : ""}
    >
      <div className={cx("w-14 truncate text-[10px]", isNext ? "text-blue-900" : "text-slate-800")} title={isNext ? emp.nextTitle : emp.currentTitle}>
        {isNext ? emp.nextTitle : emp.currentTitle}
      </div>
      
      <div className={cx("flex-1 flex items-center gap-1 min-w-0 text-[12px] font-bold", isConflict ? "text-rose-700" : isNext ? "text-[#065084]" : "text-slate-900", promoBg ? `${promoBg} px-1 rounded-sm` : "")} title={emp.name}>
        {isConflict && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" title="この枠に定員を超えて配置されています" />}
        <span className="truncate">{emp.name}</span>
      </div>
      
      <div className={cx("w-12 truncate text-[10px] text-center", isNext ? "text-blue-900" : "text-slate-800", promoBg ? `${promoBg} px-1 rounded-sm` : "")} title={isNext ? emp.nextGrade : emp.currentGrade}>
        {isNext ? emp.nextGrade : emp.currentGrade}
      </div>
      
      <div className="w-8 text-[11px] text-slate-800 text-right" title={`${age}歳`}>{age !== '' ? `${age}歳` : ''}</div>
      
      <div className={cx("w-14 text-[11px] text-right font-medium truncate shrink-0", ys >= 3 ? "text-rose-700 bg-rose-100 px-1 rounded" : "text-slate-800")} title={yd}>
        {yd}
      </div>
      
      <div className="w-16 text-[10px] text-slate-700 text-left shrink-0 ml-1 relative group/note flex items-center">
        <span className="truncate w-full block">{noteText}</span>
        {noteText && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max max-w-[200px] bg-slate-800 text-white text-[11px] p-2 rounded shadow-lg opacity-0 group-hover/note:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-pre-wrap break-words">
            {noteText}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>
      
      {!isPickingMode && (
        <div className="absolute top-1/2 -translate-y-1/2 right-1 flex gap-0.5 opacity-0 group-hover/emp:opacity-100 z-30 bg-slate-400/60 p-1 rounded-lg">
          {moveProps && (moveProps.onMoveUp || moveProps.onMoveDown) && (
            <>
              <button 
                onClick={(e) => { if(moveProps.onMoveUp) { e.stopPropagation(); moveProps.onMoveUp(); } }} 
                className={cx("p-1 rounded text-white transition-colors", moveProps.onMoveUp ? "hover:bg-slate-500/70" : "invisible")} 
                title={moveProps.onMoveUp ? "上に移動" : ""}
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => { if(moveProps.onMoveDown) { e.stopPropagation(); moveProps.onMoveDown(); } }} 
                className={cx("p-1 rounded text-white transition-colors", moveProps.onMoveDown ? "hover:bg-slate-500/70" : "invisible")} 
                title={moveProps.onMoveDown ? "下に移動" : ""}
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} 
            className="p-1 rounded text-white hover:bg-slate-500/70 transition-colors" 
            title="職員情報を編集"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {showUnassign && (
            <button 
              onClick={(e) => { e.stopPropagation(); mutations.unassignEmployee(emp.id, false); }} 
              className="p-1 rounded text-white hover:bg-rose-500/80 transition-colors" 
              title={emp.departmentId === 'retired' ? "退職・転出を取り消して未配置に戻す" : "来年度の配置を未配置に戻す"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const EmployeeRow = ({ isFirst, titleIcon, titleText, onTitleEdit, onTitleDelete, onMoveUp, onMoveDown, currentEmp, nextEmp, onCurrentClick, onNextClick, isIndent = false, isPost = false, currentMove, nextMove, currConflict, nextConflict, rowAnchorId }) => (
  <div className={cx("flex border-b relative group/row", isPost ? "border-sky-400 bg-sky-50/20" : "border-slate-300 hover:bg-slate-50")}>
    <div className={cx("w-[140px] px-2 py-1.5 border-r flex items-center shrink-0 relative", isPost ? "border-sky-400 bg-sky-200/40 border-l-4 border-l-sky-600" : "border-slate-400 bg-slate-50 border-l-4 border-l-transparent")}>
      <div className="flex items-center gap-1.5 truncate w-full" title={titleText}>
        {isIndent && isFirst && <CornerDownRight className="w-3 h-3 text-slate-400 ml-4 shrink-0" />}
        {isFirst && titleIcon}
        {isFirst && <span className={cx("text-[11px] font-bold truncate", isPost ? "text-sky-900" : "text-slate-600")}>{titleText}</span>}
      </div>
      
      {isFirst && (onTitleEdit || onTitleDelete || (isPost && (onMoveUp || onMoveDown))) && (
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover/row:opacity-100 z-30 bg-slate-400/60 p-1 rounded-lg">
          {isPost && (onMoveUp || onMoveDown) && (
            <>
              <button 
                onClick={onMoveUp} 
                className={cx("p-1 rounded text-white transition-colors", onMoveUp ? "hover:bg-slate-500/70" : "invisible")} 
                title={onMoveUp ? "上に移動" : ""}
              >
                <ArrowUp className="w-3.5 h-3.5"/>
              </button>
              <button 
                onClick={onMoveDown} 
                className={cx("p-1 rounded text-white transition-colors", onMoveDown ? "hover:bg-slate-500/70" : "invisible")} 
                title={onMoveDown ? "下に移動" : ""}
              >
                <ArrowDown className="w-3.5 h-3.5"/>
              </button>
            </>
          )}
          {onTitleEdit && (
            <button 
              onClick={onTitleEdit} 
              className="p-1 rounded text-white hover:bg-slate-500/70 transition-colors" 
              title="名前を編集"
            >
              <Edit2 className="w-3.5 h-3.5"/>
            </button>
          )}
          {onTitleDelete && (
            <button 
              onClick={onTitleDelete} 
              className="p-1 rounded text-white hover:bg-rose-500/80 transition-colors" 
              title="削除"
            >
              <Trash2 className="w-3.5 h-3.5"/>
            </button>
          )}
        </div>
      )}
    </div>
    
    <EmployeeCell 
      emp={currentEmp} 
      isNext={false} 
      isEmpty={!currentEmp} 
      onClick={onCurrentClick} 
      isPost={isPost} 
      moveProps={currentMove} 
      isConflict={currConflict} 
      hasPeer={!!nextEmp} 
    />
    
    <EmployeeCell 
      emp={nextEmp} 
      isNext={true} 
      isEmpty={!nextEmp} 
      onClick={onNextClick} 
      isPost={isPost} 
      moveProps={nextMove} 
      isConflict={nextConflict} 
      hasPeer={!!currentEmp} 
    />
    
    <div className="w-[40px] border-l border-slate-300 flex items-center justify-center shrink-0 bg-white/50 z-20">
      {isFirst && <CommentButton targetId={rowAnchorId} tooltipPos="left" />}
    </div>
  </div>
);

export const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {
  const p = isCurrent ? 'current' : 'next'; 
  const pd = isCurrent ? 'currentDeptId' : 'departmentId'; 
  const pp = isCurrent ? 'currentPostId' : 'postId'; 
  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';

  return (
    <div className={cx("p-2 rounded border flex flex-col", isCurrent ? "bg-slate-50 border-slate-200" : "bg-blue-50/50 border-blue-200")}>
      <div className="flex justify-between items-center mb-1.5 border-b pb-1">
        <h4 className={cx("font-bold text-sm", isCurrent ? "text-slate-700" : "text-[#065084]")}>{title}</h4>
        {isCurrent && setEditCurrent && (
          <label className="flex items-center gap-1 text-xs cursor-pointer" title="今年度のデータを直接編集する">
            <input type="checkbox" checked={editCurrent} onChange={(e) => setEditCurrent(e.target.checked)} className="cursor-pointer"/>
            <span className={editCurrent ? "text-slate-700 font-bold" : "text-slate-400"}>今年度を編集</span>
          </label>
        )}
      </div>
      <div className="relative flex-1">
        {isCurrent && disabled && <div className="absolute inset-0 z-10 bg-slate-50/50 cursor-not-allowed" />}
        <div className="space-y-1.5">
          <div>
            <label className="block text-xs mb-1">配置先</label>
            <PlacementSelector disabled={disabled} deptId={fd[pd]} postId={fd[pp]} groupId={fd[pg]} groupPostId={fd[pgp]} departments={departments} isNext={!isCurrent} onChange={v => setFd({...fd, [pd]: v.deptId, [pp]: v.postId, [pg]: v.groupId, [pgp]: v.groupPostId})} />
          </div>
          <div className="flex gap-2">
            <FormInput label="職名" disabled={disabled} value={fd[`${p}Title`]} onChange={v => setFd({...fd, [`${p}Title`]: v})} className="flex-1" />
            <FormSelect label="級" disabled={disabled} value={fd[`${p}Grade`]} onChange={v => setFd({...fd, [`${p}Grade`]: v})} options={GRADE_OPTIONS} className="w-[140px]" />
          </div>
          <div className="flex gap-2">
            <FormInput label="年数" type="number" disabled={disabled} value={fd[`${p}Years`]} onChange={v => setFd({...fd, [`${p}Years`]: v})} className="w-16" />
            <FormInput label="年数詳細" disabled={disabled} placeholder="派1+治1、1+1など" value={fd[`${p}SkillsStr`]} onChange={v => setFd({...fd, [`${p}SkillsStr`]: v})} className="flex-1" />
          </div>
          <div className="flex gap-2">
            <FormInput label="備考" disabled={disabled} placeholder="育代No.1：横山など" value={fd[`${p}EmploymentType`]} onChange={v => setFd({...fd, [`${p}EmploymentType`]: v})} className="flex-1" />
            <FormInputWithList label="カウント除外" disabled={disabled} placeholder="事務職など" value={fd[`${p}Exclude`]} onChange={v => setFd({...fd, [`${p}Exclude`]: v})} options={["事務職", "技術職", "短時間"]} listId={`exclude-list-${p}`} className="w-24" />
          </div>
        </div>
      </div>
    </div>
  );
};


const getEraSuffix = (year) => {
  const y = parseInt(year);
  if (isNaN(y)) return '';
  if (y >= 2019) return `R${y - 2018}`;
  if (y >= 1989) return `H${y - 1988}`;
  if (y >= 1926) return `S${y - 1925}`;
  return '';
};

const YearInput = ({ label, value, onChange, birthDate }) => {
  let promoAge = null;
  if (birthDate && value && !isNaN(parseInt(value))) {
    promoAge = calculateAge(birthDate, parseInt(value));
  }
  return (
    <div className="flex flex-col w-full">
      <span className="text-[11px] font-bold text-slate-600 mb-1">{label}</span>
      <div className="flex items-center w-full px-1.5 py-1 text-sm border border-slate-300 rounded bg-white shadow-inner focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text overflow-hidden">
        <input 
          type="text" 
          maxLength={4}
          value={value || ''} 
          onChange={e => {
            const val = e.target.value.replace(/[^0-9]/g, '');
            onChange(val);
          }} 
          placeholder="YYYY"
          className="w-[36px] outline-none bg-transparent placeholder-slate-300" 
        />
        {value && (
          <span className="text-[10px] text-slate-500 font-bold tracking-tighter shrink-0 pt-[1px] ml-1 pointer-events-none select-none">
            {getEraSuffix(value)}
          </span>
        )}
        {promoAge !== null && !isNaN(promoAge) && (
          <span className="text-[10px] text-slate-500 font-bold tracking-tighter shrink-0 pt-[1px] ml-1 pointer-events-none select-none">
            {promoAge}歳
          </span>
        )}
      </div>
    </div>
  );
};

export const EmployeeModal = ({ isOpen, onClose, onSave, initialData, departments }) => {
  const def = { employeeNumber: '', name: '', birthDate: '', education: '', hireDate: '', note: '', currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null, currentTitle: '', currentGrade: '', currentYears: 0, currentSkillsStr: '', currentEmploymentType: '', currentExclude: '', departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null, nextTitle: '', nextGrade: '', nextYears: 1, nextSkillsStr: '', nextEmploymentType: '', nextExclude: '', promoYearDeptHead: '', promoYearDeputyHead: '', promoYearDivHead: '', promoYearSecHead: '', promoYearAssistant3: '', promoYearAssistant2: '', promoYearAssistant1: '', promoYearChief: '' };
  const { targetYear } = useApp();
  const [fd, setFd] = useState(def); 
  const [editCurrent, setEditCurrent] = useState(false);
  
  useEffect(() => { 
    if (isOpen) { 
      setFd(initialData ? { 
        ...initialData, 
        currentSkillsStr: (initialData.currentSkills || []).join('、'), 
        nextSkillsStr: (initialData.nextSkills || []).join('、') 
      } : def); 
      setEditCurrent(!initialData); 
    } 
  }, [isOpen, initialData]);
  
  if (!isOpen) return null;

  const save = () => { 
    const ps = (s) => (s || '').split(',').reduce((a, x) => a.concat(x.split('、')), []).map(x => x.trim()).filter(Boolean); 
    const d = { 
      ...fd, 
      currentYears: Number(fd.currentYears), 
      nextYears: Number(fd.nextYears), 
      currentSkills: ps(fd.currentSkillsStr), 
      nextSkills: ps(fd.nextSkillsStr) 
    }; 
    delete d.currentSkillsStr; 
    delete d.nextSkillsStr; 
    onSave(d); 
    onClose(); 
  };


  const pKeys = ['hire', 'promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];
  
  // Find index of last filled
  let lastFilledIdx = 0;
  for (let i = pKeys.length - 1; i >= 0; i--) {
    const val = pKeys[i] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[i]]);
    if (!isNaN(val)) {
      lastFilledIdx = i;
      break;
    }
  }

  const ArrowDiff = ({ currentKey }) => {
    let currentIdx = pKeys.indexOf(currentKey);
    if (currentIdx === -1) {
      // It's the final dummy arrow after DeptHead
      currentIdx = pKeys.length; 
    }

    if (currentIdx <= lastFilledIdx) {
      // Normal arrow between filled
      const currentY = pKeys[currentIdx] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[currentIdx]]);
      let prevY = NaN;
      for (let i = currentIdx - 1; i >= 0; i--) {
        const y = pKeys[i] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[i]]);
        if (!isNaN(y)) { prevY = y; break; }
      }
      const diff = (!isNaN(currentY) && !isNaN(prevY)) ? currentY - prevY : null;
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded mb-0.5 whitespace-nowrap">{diff !== null && diff >= 0 ? diff + 1 : 1}年目</span>
          <ChevronRight className="w-4 h-4 text-emerald-500" />
        </div>
      );
    } else if (currentIdx === lastFilledIdx + 1) {
      // Final "来年度まで" arrow
      const lastY = pKeys[lastFilledIdx] === 'hire' ? (fd.hireDate ? parseInt(fd.hireDate.substring(0,4)) : NaN) : parseInt(fd[pKeys[lastFilledIdx]]);
      const diff = !isNaN(lastY) ? (targetYear - lastY + 1) : null;
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <span className="text-[9px] font-bold text-blue-600 leading-tight whitespace-nowrap">来年度</span>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1 rounded border border-blue-200 mb-0.5 whitespace-nowrap">{diff !== null && diff >= 0 ? diff : 0}年目</span>
          <ChevronRight className="w-4 h-4 text-blue-500" />
        </div>
      );
    } else {
      // Empty gray arrow
      if (currentKey === 'finalArrow') {
        return <div className="flex flex-col items-center justify-end h-full pb-1"></div>;
      }
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <ChevronRight className="w-4 h-4 text-slate-300 mb-1" />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-lg p-5 max-w-3xl w-full shadow-xl border-t-4 border-[#065084] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <div>
            <h3 className="text-xl font-bold text-[#065084]">職員情報編集</h3>
            <p className="text-sm text-slate-500 mt-1">
              基本情報やスキル、異動案（現行・新）を編集します。
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3 overflow-y-auto flex-1 pr-2 pb-1">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 w-full">
              <FormInput label="職員番号" value={fd.employeeNumber} onChange={v => setFd({...fd, employeeNumber: v})} className="w-[75px] shrink-0" />
              <FormInput label="氏名" value={fd.name} onChange={v => setFd({...fd, name: v})} className="flex-1 min-w-0" />
              <FormInput label="生年月日" type="date" value={fd.birthDate} onChange={v => setFd({...fd, birthDate: v})} className="w-[115px] shrink-0" />
              <FormInput label="学歴" value={fd.education} onChange={v => setFd({...fd, education: v})} className="flex-1 min-w-0" />
              <FormInput label="採用年月" type="date" value={fd.hireDate} onChange={v => setFd({...fd, hireDate: v})} className="w-[115px] shrink-0" />
            </div>
            <FormInput label="特記事項" value={fd.note} onChange={v => setFd({...fd, note: v})} className="w-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 my-3">
            <EmployeeFormSection title="今年度（現行）" isCurrent={true} disabled={!editCurrent} fd={fd} setFd={setFd} departments={departments} editCurrent={editCurrent} setEditCurrent={setEditCurrent} />
            <EmployeeFormSection title="来年度（新）" isCurrent={false} disabled={false} fd={fd} setFd={setFd} departments={departments} />
          </div>

          <div className="border border-slate-300 rounded p-2.5 mb-3 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2">
              昇進年度 (西暦(和暦)) と経過年数
            </h4>
            <div className="grid grid-cols-[98px_1fr_98px_1fr_98px_1fr_98px_1fr_98px_1fr] gap-y-3 items-end justify-items-center">
              {/* Top Row */}
              <div className="flex flex-col w-full shrink-0">
                <span className="text-[11px] font-bold text-slate-600 mb-1">採用</span>
                <div className="px-1 py-1 bg-slate-200 text-slate-700 rounded text-xs font-bold shadow-inner border border-slate-300 h-[30px] flex items-center justify-center tracking-tighter overflow-hidden">
                  {fd.hireDate ? (() => {
                    const hYear = parseInt(fd.hireDate.substring(0, 4));
                    const hAge = (fd.birthDate && !isNaN(hYear)) ? calculateAge(fd.birthDate, hYear) : null;
                    return (
                      <div className="flex items-baseline">
                        <span>{hYear}</span>
                        <span className="ml-1 text-[10px] text-slate-500 font-bold">{getEraSuffix(hYear)}</span>
                        {hAge !== null && !isNaN(hAge) && (
                          <span className="ml-1 text-[10px] text-slate-500 font-bold">{hAge}歳</span>
                        )}
                      </div>
                    );
                  })() : '----'}
                </div>
              </div>
              <ArrowDiff currentKey="promoYearChief" />
              <YearInput birthDate={fd.birthDate} label="係長級(主査)" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} />
              <ArrowDiff currentKey="promoYearAssistant1" />
              <YearInput birthDate={fd.birthDate} label="補佐級I(主任)" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} />
              <ArrowDiff currentKey="promoYearAssistant2" />
              <YearInput birthDate={fd.birthDate} label="補佐級II(班長)" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} />
              <ArrowDiff currentKey="promoYearAssistant3" />
              <YearInput birthDate={fd.birthDate} label="補佐級III" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} />
              <div className="w-full opacity-0 pointer-events-none"></div>

              {/* Bottom Row */}
              <div className="w-full opacity-0 pointer-events-none"></div>
              <ArrowDiff currentKey="promoYearSecHead" />
              <YearInput birthDate={fd.birthDate} label="課長級" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} />
              <ArrowDiff currentKey="promoYearDivHead" />
              <YearInput birthDate={fd.birthDate} label="所属長級" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} />
              <ArrowDiff currentKey="promoYearDeputyHead" />
              <YearInput birthDate={fd.birthDate} label="次長級" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} />
              <ArrowDiff currentKey="promoYearDeptHead" />
              <YearInput birthDate={fd.birthDate} label="部長級" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} />
              <ArrowDiff currentKey="finalArrow" />
            </div>
          </div>

          <div className="border border-slate-300 rounded p-2.5 mt-3 bg-slate-50/50">
            <h4 className="font-bold text-sm text-slate-700 mb-2">履歴</h4>
            <div className="grid grid-cols-5 gap-y-2 gap-x-4 pl-3 pr-1">
              {(() => {
                const baseHistory = [...(fd.history || [])].sort((a, b) => a.year - b.year);
                const nextDeptStr = getPlacementName(fd.departmentId, fd.postId, fd.groupId, fd.groupPostId, departments);
                const displayHistory = [...baseHistory];
                if (nextDeptStr && nextDeptStr !== ' / 課直属' && nextDeptStr !== '未配置') {
                  if (!displayHistory.find(h => h.year === targetYear)) {
                    displayHistory.push({ year: targetYear, department: nextDeptStr, isNext: true });
                  }
                }

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {
                  const histAge = (fd.birthDate && !isNaN(h.year)) ? calculateAge(fd.birthDate, h.year) : null;
                  const isLastInRow = (i + 1) % 5 === 0;
                  const isLast = i === arr.length - 1;
                  const isRowStart = i % 5 === 0 && i !== 0;
                  return (
                    <div key={i} className="relative flex flex-col bg-white border px-2 py-1 rounded shadow-sm w-full min-w-0" title={h.department || '-'}>
                      {isRowStart && (
                        <ChevronRight className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-[10px] text-slate-500 font-bold border-b w-full pb-0.5 mb-0.5 whitespace-nowrap text-center">
                        {h.year} ({getEraSuffix(h.year)})
                        {histAge !== null && !isNaN(histAge) && <span className="ml-0.5 text-[9px]">{histAge}歳</span>}
                        {h.isNext && <span className="ml-1 text-[9px] text-[#065084]">(予定)</span>}
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 text-left truncate w-full">
                        {h.department || '-'}
                      </span>
                      {!isLast && !isLastInRow && (
                        <ChevronRight className="absolute -right-[18px] top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  );
                }) : <span className="text-sm text-slate-500">履歴情報はありません</span>;
              })()}
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 border rounded" title="変更を破棄して閉じる">キャンセル</button>
          <button onClick={save} className="px-6 py-2 bg-[#065084] text-white rounded font-bold" title="職員情報を保存する">保存</button>
        </div>
      </div>
    </div>
  );
};


