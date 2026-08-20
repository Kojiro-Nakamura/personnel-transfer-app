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


export const CommentButton = ({ targetId, theme = 'light', tooltipPos = 'right', hoverClass = 'group-hover/row:opacity-100' }) => {
  const { notes, openModal } = useApp();
  const note = notes.find(n => n.targetId === targetId);
  const hasNote = !!(note && note.text);

  const btnClass = theme === 'dark' 
    ? (hasNote ? "text-amber-300 hover:text-amber-100" : "text-slate-400 hover:text-slate-200")
    : (hasNote ? "text-sky-500 hover:text-sky-600" : "text-slate-300 hover:text-slate-500");

  return (
    <div className={cx("flex items-center group/tooltip relative", !hasNote && `opacity-0 transition-opacity ${hoverClass}`)}>
      <button 
        onClick={(e) => { e.stopPropagation(); openModal('note', { targetId, text: note?.text || '' }); }}
        className={cx("p-1 transition-colors rounded", btnClass)}
        title="コメントを追加/編集"
      >
        {hasNote ? <MessageSquareText className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
      </button>
      
      {hasNote && (
        <div className={cx(
          "absolute w-48 bg-slate-800 text-white text-[11px] p-2.5 rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-[100] whitespace-pre-wrap break-words text-left", 
          tooltipPos === 'right' ? "top-1/2 -translate-y-1/2 left-full ml-2" : 
          tooltipPos === 'left' ? "top-1/2 -translate-y-1/2 right-full mr-2" : 
          tooltipPos === 'bottom-right' ? "top-full right-0 mt-2" : ""
        )}>
          {note.text}
          <div className={cx(
            "absolute border-4 border-transparent", 
            tooltipPos === 'right' ? "top-1/2 -translate-y-1/2 -left-1 border-r-slate-800" : 
            tooltipPos === 'left' ? "top-1/2 -translate-y-1/2 -right-1 border-l-slate-800" : 
            tooltipPos === 'bottom-right' ? "bottom-full right-2 border-b-slate-800" : ""
          )}></div>
        </div>
      )}
    </div>
  );
};

export const FormInput = ({ label, value, onChange, onBlur, type = "text", disabled = false, placeholder = "", className = "", inputClassName = "" }) => (
  <div className={className}>
    <label className={cx("block text-[11px] mb-0.5", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <input 
      type={type} 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      onBlur={onBlur}
      disabled={disabled} 
      placeholder={placeholder} 
      className={cx("w-full h-[28px] border rounded px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : (inputClassName || "bg-white"), placeholder ? "placeholder:text-slate-400" : "")} 
    />
  </div>
);

export const FormInputWithList = ({ label, value, onChange, disabled = false, placeholder = "", listId, options, className = "" }) => (
  <div className={className}>
    <label className={cx("block text-[11px] mb-0.5", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <input 
      type="text" 
      list={listId} 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      placeholder={placeholder} 
      className={cx("w-full h-[28px] border rounded px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : "bg-white", placeholder ? "placeholder:text-slate-400" : "")} 
    />
    <datalist id={listId}>
      {options.map(o => <option key={o} value={o} />)}
    </datalist>
  </div>
);

export const FormSelect = ({ label, value, onChange, options, disabled = false, className = "", selectClassName = "" }) => (
  <div className={className}>
    <label className={cx("block text-[11px] mb-0.5", disabled ? "text-slate-400" : "text-slate-600")}>{label}</label>
    <select 
      value={value !== undefined ? value : ''} 
      onChange={e => onChange(e.target.value)} 
      disabled={disabled} 
      className={cx("w-full h-[28px] border rounded px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#0F828C]", disabled ? "bg-slate-100 text-slate-500" : (selectClassName || "bg-white"))}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export const PlacementSelector = ({ deptId, postId, groupId, groupPostId, departments, isNext, onChange, disabled, className = "flex h-[28px] gap-1" }) => {
  const parse = (v) => { 
    if (v.startsWith('post:')) return { deptId, postId: v.split(':')[1], groupId: null, groupPostId: null }; 
    if (v.startsWith('groupPost:')) { const p = v.split(':'); return { deptId, postId: null, groupId: p[1], groupPostId: p[2] }; } 
    if (v.startsWith('group:')) return { deptId, postId: null, groupId: v.split(':')[1], groupPostId: null }; 
    return { deptId, postId: null, groupId: null, groupPostId: null }; 
  };
  
  const val = postId ? `post:${postId}` : groupPostId ? `groupPost:${groupId}:${groupPostId}` : groupId ? `group:${groupId}` : 'direct';
  
  return (
    <div className={className}>
      <select 
        value={deptId || 'unassigned'} 
        onChange={e => onChange({ deptId: e.target.value, postId: null, groupId: null, groupPostId: null })} 
        disabled={disabled} 
        className={cx("w-1/2 px-1 border border-slate-300 rounded text-xs outline-none", disabled ? "bg-slate-100 text-slate-500" : "bg-white")}
      >
        <option value="unassigned">配置待ち</option>
        {departments.filter(d => d.id !== 'retired' && d.id !== 'unassigned').map(d => (
          <option key={d.id} value={d.id}>{isNext ? (d.nextName && d.nextName !== d.name ? `${d.name} / ${d.nextName}` : (d.nextName || d.name)) : d.name}</option>
        ))}
        <option value="retired">退職・転出</option>
      </select>
      
      <select 
        value={val} 
        onChange={e => onChange(parse(e.target.value))} 
        disabled={disabled || (deptId === 'unassigned' || deptId === 'retired')} 
        className={cx("w-1/2 px-1 border border-slate-300 rounded text-xs outline-none", (disabled || !deptId || deptId === 'unassigned' || deptId === 'retired') ? "bg-slate-100 text-slate-500" : "bg-white")}
      >
        <option value="direct">（未配置/直属）</option>
        {departments.find(d => d.id === deptId)?.posts?.length > 0 && (
          <optgroup label="課直属ポスト">
            {departments.find(d => d.id === deptId).posts.map(p => (
              <option key={p.id} value={`post:${p.id}`}>{isNext ? (p.nextName && p.nextName !== p.name ? `${p.name} / ${p.nextName}` : (p.nextName || p.name)) : p.name}</option>
            ))}
          </optgroup>
        )}
        {departments.find(d => d.id === deptId)?.groups?.length > 0 && (
          <optgroup label="班・グループ">
            {departments.find(d => d.id === deptId).groups.map(g => (
              <React.Fragment key={g.id}>
                {(g.posts || []).map(gp => (
                  <option key={gp.id} value={`groupPost:${g.id}:${gp.id}`}>■ {isNext ? (g.nextName && g.nextName !== g.name ? `${g.name} / ${g.nextName}` : (g.nextName || g.name)) : g.name} - {isNext ? (gp.nextName && gp.nextName !== gp.name ? `${gp.name} / ${gp.nextName}` : (gp.nextName || gp.name)) : gp.name}</option>
                ))}
                <option value={`group:${g.id}`}>└ {isNext ? (g.nextName || g.name) : g.name}（班員）</option>
              </React.Fragment>
            ))}
          </optgroup>
        )}
      </select>
    </div>
  );
};

