import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { 
  Edit2, Trash2, ArrowUp, ArrowDown, UserMinus, UserCheck, 
  UserPlus, FolderPlus, Layers, Building2, Award, Users, 
  ChevronDown, X, CornerDownRight 
} from 'lucide-react';
import { cx } from '../../utils/helpers.js';

export const ContextMenu = ({ contextMenu, onClose, useAppHook }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!contextMenu) return null;

  const { x, y, type, data } = contextMenu;
  const { openModal, mutations, toggleDept, handleCellClick, selectedEmp, cancelSelection } = useAppHook;

  const MenuItem = ({ icon: Icon, label, onClick, disabled = false, danger = false, hint }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClose();
        onClick?.();
      }}
      className={cx(
        "w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors font-medium rounded-md select-none",
        disabled 
          ? "opacity-35 cursor-not-allowed text-slate-400" 
          : danger 
            ? "text-rose-600 hover:bg-rose-50 active:bg-rose-100" 
            : "text-slate-700 hover:bg-sky-50 hover:text-sky-700 active:bg-sky-100"
      )}
    >
      <div className="flex items-center gap-2 truncate">
        {Icon && <Icon className={cx("w-4 h-4 shrink-0", danger ? "text-rose-500" : "text-slate-500")} />}
        <span className="truncate">{label}</span>
      </div>
      {hint && <span className="text-[10px] text-slate-400 ml-2 font-mono shrink-0">{hint}</span>}
    </button>
  );

  const Separator = () => <div className="h-px bg-slate-200/70 my-1 -mx-1" />;

  const Header = ({ icon: Icon, title, badge }) => (
    <div className="px-3 py-1.5 border-b border-slate-100 -mt-1 -mx-1 mb-1 bg-slate-50/80 rounded-t-lg flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-sky-600 shrink-0" />}
        <span className="font-bold text-xs text-slate-800 truncate" title={title}>{title}</span>
      </div>
      {badge && (
        <span className="text-[10px] bg-slate-200/80 text-slate-600 px-1.5 py-0.5 rounded font-normal shrink-0">
          {badge}
        </span>
      )}
    </div>
  );

  return (
    <>
      <div 
        className="fixed inset-0 z-[9998] bg-transparent"
        onMouseDown={onClose}
        onContextMenu={(e) => {
          onClose();
        }}
      />
      <div
        ref={menuRef}
        style={{ top: `${y}px`, left: `${x}px` }}
        className="fixed z-[9999] min-w-[210px] max-w-[280px] bg-white border border-slate-200/90 shadow-2xl rounded-xl p-1.5 text-slate-800 select-none animate-in fade-in duration-75"
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
      {type === 'employee' && (() => {
        const { emp, isNext, moveProps } = data;
        const isPickingThis = selectedEmp && selectedEmp.id === emp.id;
        const canUnassign = emp && (isNext || emp.departmentId !== 'unassigned');
        const unassignLabel = emp.departmentId === 'retired' 
          ? '退職を取り消して未配置に戻す' 
          : '未配置に戻す';

        return (
          <>
            <Header 
              icon={Users} 
              title={emp.name} 
              badge={isNext ? (emp.nextTitle || '来年度') : (emp.currentTitle || '今年度')} 
            />
            <MenuItem
              icon={Edit2}
              label="職員情報を編集"
              onClick={() => openModal('emp', emp)}
            />
            {canUnassign && (
              <MenuItem
                icon={UserMinus}
                label={unassignLabel}
                onClick={() => mutations.unassignEmployee(emp.id, false)}
              />
            )}
            
            <Separator />

            <MenuItem
              icon={ArrowUp}
              label="上に移動"
              hint="↑"
              disabled={!moveProps?.onMoveUp}
              onClick={() => moveProps?.onMoveUp?.()}
            />
            <MenuItem
              icon={ArrowDown}
              label="下に移動"
              hint="↓"
              disabled={!moveProps?.onMoveDown}
              onClick={() => moveProps?.onMoveDown?.()}
            />

            <Separator />

            <MenuItem
              icon={UserCheck}
              label={isPickingThis ? "選択モードを解除" : "異動先を指定（選択）"}
              onClick={() => {
                if (isPickingThis) {
                  cancelSelection();
                } else {
                  handleCellClick(emp.id, !isNext);
                }
              }}
            />

            <Separator />

            <MenuItem
              icon={Trash2}
              label="職員を削除"
              danger={true}
              onClick={() => openModal('delConfirm', { type: 'emp', id: emp.id, title: emp.name })}
            />
          </>
        );
      })()}

      {type === 'post' && (() => {
        const { deptId, postId, postName, onTitleEdit, onTitleDelete, onMoveUp, onMoveDown, groupId } = data;
        return (
          <>
            <Header 
              icon={Award} 
              title={postName} 
              badge="ポスト" 
            />
            {onTitleEdit && (
              <MenuItem
                icon={Edit2}
                label="ポスト名を編集"
                onClick={onTitleEdit}
              />
            )}
            <MenuItem
              icon={UserPlus}
              label="職員をここに配置"
              onClick={() => handleCellClick(null, false, deptId, postId, groupId, null)}
            />

            <Separator />

            <MenuItem
              icon={ArrowUp}
              label="ポストを上に移動"
              hint="↑"
              disabled={!onMoveUp}
              onClick={() => onMoveUp?.()}
            />
            <MenuItem
              icon={ArrowDown}
              label="ポストを下に移動"
              hint="↓"
              disabled={!onMoveDown}
              onClick={() => onMoveDown?.()}
            />

            {onTitleDelete && (
              <>
                <Separator />
                <MenuItem
                  icon={Trash2}
                  label="ポストを削除"
                  danger={true}
                  onClick={onTitleDelete}
                />
              </>
            )}
          </>
        );
      })()}

      {type === 'department' && (() => {
        const { dept, onMoveUp, onMoveDown } = data;
        const displayName = dept.nextName && dept.nextName !== dept.name 
          ? `${dept.name} / ${dept.nextName}` 
          : dept.name;

        return (
          <>
            <Header 
              icon={Building2} 
              title={displayName} 
              badge="部署" 
            />
            <MenuItem
              icon={Edit2}
              label="部署の設定・名前編集"
              onClick={() => openModal('dept', dept)}
            />
            <MenuItem
              icon={ChevronDown}
              label="折りたたむ / 展開する"
              onClick={() => toggleDept(dept.id)}
            />

            <Separator />

            <MenuItem
              icon={ArrowUp}
              label="部署を上に移動"
              hint="↑"
              disabled={!onMoveUp}
              onClick={() => onMoveUp?.()}
            />
            <MenuItem
              icon={ArrowDown}
              label="部署を下に移動"
              hint="↓"
              disabled={!onMoveDown}
              onClick={() => onMoveDown?.()}
            />

            <Separator />

            <MenuItem
              icon={UserPlus}
              label="ポストを追加"
              onClick={() => openModal('post', { deptId: dept.id })}
            />
            <MenuItem
              icon={FolderPlus}
              label="班を追加"
              onClick={() => openModal('group', { deptId: dept.id })}
            />

            <Separator />

            <MenuItem
              icon={Trash2}
              label="部署を削除"
              danger={true}
              onClick={() => openModal('delConfirm', { type: 'dept', id: dept.id, title: dept.name })}
            />
          </>
        );
      })()}

      {type === 'group' && (() => {
        const { deptId, group, onMoveUp, onMoveDown } = data;
        const displayName = group.nextName && group.nextName !== group.name 
          ? `${group.name} / ${group.nextName}` 
          : group.name;

        return (
          <>
            <Header 
              icon={Layers} 
              title={displayName} 
              badge="班" 
            />
            <MenuItem
              icon={Edit2}
              label="班の設定・名前編集"
              onClick={() => openModal('group', { deptId, group })}
            />

            <Separator />

            <MenuItem
              icon={ArrowUp}
              label="班を上に移動"
              hint="↑"
              disabled={!onMoveUp}
              onClick={() => onMoveUp?.()}
            />
            <MenuItem
              icon={ArrowDown}
              label="班を下に移動"
              hint="↓"
              disabled={!onMoveDown}
              onClick={() => onMoveDown?.()}
            />

            <Separator />

            <MenuItem
              icon={UserPlus}
              label="班内ポストを追加"
              onClick={() => openModal('groupPost', { deptId, groupId: group.id })}
            />

            <Separator />

            <MenuItem
              icon={Trash2}
              label="班を削除"
              danger={true}
              onClick={() => openModal('delConfirm', { type: 'group', deptId, id: group.id, title: group.name })}
            />
          </>
        );
      })()}
    </div>
    </>
  );
};
