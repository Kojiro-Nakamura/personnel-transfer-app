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


import { EmployeeCell } from '../employee/EmployeeComponents.jsx';
import { CommentButton } from '../ui/CommonUI.jsx';
export const SidebarCard = ({ emp, isRetired, onClick }) => {
  const { selectedEmp, isPickingMode, hoveredEmpId, setHoveredEmpId, targetYear, openModal, mutations } = useApp();
  const isSelected = !!(selectedEmp && emp && selectedEmp.id === emp.id);
  
  const defaultBorder = isRetired ? "border-[3px] border-dotted border-slate-800" : "border-[3px] border-dashed border-orange-400";
  const defaultBg = isRetired ? "bg-slate-50" : "bg-orange-50/50";

  const currentAge = calculateAge(emp.birthDate, targetYear - 1);

  return (
    <div 
      onClick={onClick} 
      onMouseEnter={() => setHoveredEmpId(emp.id)} 
      onMouseLeave={() => setHoveredEmpId(null)} 
      className={cx(
        "rounded px-1.5 py-1 flex items-center justify-between relative group/side transition-all duration-200 cursor-pointer",
        isSelected ? cx(defaultBorder, "ring-2 ring-inset ring-[#0F828C] bg-[#0F828C]/10") : 
        isPickingMode && !isSelected ? "hover:ring-2 hover:ring-inset hover:ring-amber-500 bg-white border-[3px] border-solid border-slate-300" : 
        cx(defaultBorder, emp.id === hoveredEmpId ? "bg-yellow-200 z-20 shadow-md transform -translate-y-0.5" : defaultBg)
      )} 
      title={emp.name}
    >
      <div className="flex items-baseline gap-1.5 flex-1 min-w-0 pr-1">
        <span className={cx("font-bold text-[11.5px] truncate shrink-0 max-w-[75%]", isRetired ? "text-slate-900" : "text-[#320A6B]")} title={emp.name}>
          {emp.name}
        </span>
        <span className="text-[9px] text-slate-800 truncate flex-1 min-w-0" title={emp.currentTitle || '新採'}>
          {emp.currentTitle || '新採'}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0 z-20">
        {!isPickingMode && (
          <div className="opacity-0 group-hover/side:opacity-100 flex gap-0.5 bg-slate-400/80 p-0.5 rounded-lg shadow mr-1 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} 
              className="p-0.5 rounded text-white hover:bg-slate-500/70 transition-colors" 
              title="職員情報を編集"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            {isRetired && (
              <button 
                onClick={(e) => { e.stopPropagation(); mutations.unassignEmployee(emp.id, false); }} 
                className="p-0.5 rounded text-white hover:bg-rose-500/80 transition-colors" 
                title="未配置に戻す"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
        <span className="text-[9.5px] text-slate-800 shrink-0 mr-1" title={currentAge !== '' ? `${currentAge}歳` : ''}>
          {currentAge !== '' ? `${currentAge}歳` : ''}
        </span>
        <div onClick={e => e.stopPropagation()}>
          <CommentButton targetId={`side-${emp.id}`} tooltipPos="bottom-right" hoverClass="group-hover/side:opacity-100" />
        </div>
      </div>
    </div>
  );
};

export const AppSidebar = () => {
  const { nextMap, isPickingMode, handleCellClick } = useApp();
  return (
    <div className="w-full md:w-[260px] flex flex-col gap-2 shrink-0 h-full">
      <div 
        className={cx("bg-white rounded shadow-sm border border-slate-400 flex flex-col flex-1 border-t-4 border-amber-500 overflow-hidden transition-all", isPickingMode && "ring-2 ring-amber-400 ring-offset-1 cursor-pointer")}
        onClick={() => { if (isPickingMode) handleCellClick(null, false, 'unassigned', null, null, null); }}
        title={isPickingMode ? "選択中の職員を「未配置」にします" : ""}
      >
        <div className="bg-slate-100 p-2 border-b border-slate-400 font-bold text-xs flex justify-between items-center shrink-0 group/sideheader">
          <div className="flex items-center gap-1.5 text-slate-700">
            <AlertCircle className="w-4 h-4 text-amber-600" />未配置・保留
          </div>
          <CommentButton targetId="side-unassigned-header" tooltipPos="bottom-right" hoverClass="group-hover/sideheader:opacity-100" />
        </div>
        <div className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 border-b border-slate-300 shrink-0">来年度の未配置 ({nextMap.unassigned.length})</div>
        <div className={cx("flex-1 overflow-y-auto p-1 flex flex-col gap-0.5", isPickingMode ? "bg-amber-50/50" : "bg-slate-50")}>
           {nextMap.unassigned.map(emp => (
             <SidebarCard 
               key={emp.id} 
               emp={emp} 
               isRetired={false} 
               onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'unassigned', null, null, null); }} 
             />
           ))}
        </div>
      </div>
      
      <div 
        className={cx("bg-white rounded shadow-sm border border-slate-400 flex flex-col flex-1 border-t-4 border-rose-500 overflow-hidden transition-all", isPickingMode && "ring-2 ring-rose-400 ring-offset-1 cursor-pointer")}
        onClick={() => { if (isPickingMode) handleCellClick(null, false, 'retired', null, null, null); }}
        title={isPickingMode ? "選択中の職員を「退職・転出」にします" : ""}
      >
         <div className="bg-slate-100 p-2 border-b border-slate-400 font-bold text-xs flex justify-between items-center shrink-0 group/sideheader">
           <div className="flex items-center gap-1.5 text-slate-700">
             <UserMinus className="w-4 h-4 text-rose-600" />退職・転出
           </div>
           <CommentButton targetId="side-retired-header" tooltipPos="bottom-right" hoverClass="group-hover/sideheader:opacity-100" />
         </div>
        <div className="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-600 border-b border-slate-300 shrink-0">来年度の退職 ({nextMap.retired.length})</div>
        <div className={cx("flex-1 overflow-y-auto p-1 flex flex-col gap-0.5", isPickingMode ? "bg-rose-50/50" : "bg-slate-50")}>
          {nextMap.retired.map(emp => (
            <SidebarCard 
              key={emp.id} 
              emp={emp} 
              isRetired={true} 
              onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'retired', null, null, null); }} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

