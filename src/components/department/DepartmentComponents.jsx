import React, { useState, useMemo, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { 
  Users, Building2, UserPlus, CornerDownRight, Layers, Award, AlertCircle, 
  UserMinus, Edit2, Trash2, X, Plus, FolderPlus, Undo, Redo, 
  FolderOpen, Download, ChevronsRight, Copy, ZoomIn, ZoomOut, ArrowUp, ArrowDown, ChevronDown, ChevronRight, ChevronUp,
  ChevronsUp, ChevronsDown, Filter, Table, List, FileText, DownloadCloud, MessageSquare, MessageSquareText
} from 'lucide-react';
import { useApp, AppProvider } from '../../contexts/AppContext.jsx';
import { cx, getGradeLevel, isPromotedGrade, getPromotedBgClass, getPromotedBgColorCode, calculateAge, parseJapaneseDate, parseCSVRow, getPairs, getCounts, formatCountText, generateGradeSummary, filterDirects, calcNextSkills, calcOrder, clearPlacement, createMoveProps, downloadFile, traverseOrgTree, getPlacementName, isDeptVisible, isGroupVisible } from '../../utils/helpers.js';
import { GRADE_OPTIONS, STORAGE_KEY, GRADE_LEVELS } from '../../constants/config.js';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from '../../constants/initialData.js';


import { EmployeeCell, EmployeeRow } from '../employee/EmployeeComponents.jsx';
import { CommentButton } from '../ui/CommonUI.jsx';
export const AddSlotRow = ({ label, indentClass, onClickNext, anchorId }) => {
  const { filterLevel, isPickingMode, selectedEmp } = useApp();
  if (filterLevel > 0) return null;
  return (
    <div className="flex border-b border-slate-400 relative group/row">
      <div className="w-[140px] px-2 py-1 border-r border-slate-400 flex items-center bg-white shrink-0">
        <span className={cx("text-[10px] text-slate-400 truncate border border-dashed border-slate-400 px-1 rounded", indentClass)}>
          {label}
        </span>
      </div>
      <div className="flex-1 border-r border-slate-400 bg-transparent"></div>
      <div 
        onClick={onClickNext} 
        className={cx(
          "flex-1 flex items-center justify-center text-[11px] font-bold transition-all border-dashed border border-transparent cursor-pointer", 
          isPickingMode ? "hover:bg-amber-50 text-slate-800" : "text-slate-400 hover:bg-blue-50 hover:text-blue-500 hover:border-blue-300"
        )} 
        title={isPickingMode && selectedEmp?.isSource ? "選択中の職員をここに配置します" : "ここへ配置する職員を選択します"}
      >
        {isPickingMode && selectedEmp?.isSource ? "+ ここに配置" : "+ 職員を選択"}
      </div>
      <div className="w-[40px] border-l border-slate-300 flex items-center justify-center shrink-0 bg-slate-50/50 z-20">
        <CommentButton targetId={anchorId} tooltipPos="left" />
      </div>
    </div>
  );
};

export const DepartmentBlock = ({ dept, onMoveUp, onMoveDown }) => {
  const { deptMap, filterLevel, collapsedDepts, toggleDept, openModal, mutations, handleCellClick } = useApp();
  const isCollapsed = !!collapsedDepts[dept.id]; console.log('DEPT RENDER:', dept.name, dept.nextName); 
  const dm = deptMap[dept.id];
  
  if (filterLevel > 0 && !isDeptVisible(dept, dm, filterLevel)) {
    return null;
  }
  
  const deptCurrEmps = [...dm.direct.current];
  const deptNextEmps = [...dm.direct.next];
  
  Object.values(dm.posts).forEach(p => { 
    deptCurrEmps.push(...p.current); 
    deptNextEmps.push(...p.next); 
  });
  
  Object.values(dm.groups).forEach(g => {
    deptCurrEmps.push(...g.direct.current); 
    deptNextEmps.push(...g.direct.next);
    Object.values(g.posts).forEach(gp => { 
      deptCurrEmps.push(...gp.current); 
      deptNextEmps.push(...gp.next); 
    });
  });
  
  const cCounts = getCounts(deptCurrEmps, false);
  const nCounts = getCounts(deptNextEmps, true);

  return (
    <div className="border-b-4 border-slate-400 relative">
      {!isCollapsed && <div className="absolute inset-y-0 left-[140px] w-[calc(100%-140px-40px)] bg-slate-100/30 pointer-events-none z-[5]" />}
      <div className="bg-slate-500 text-white px-2 py-1.5 flex justify-between items-center group/dept">
        <div className="flex items-center gap-2">
          <div 
            className="cursor-pointer hover:bg-slate-400 rounded p-0.5" 
            onClick={() => toggleDept(dept.id)} 
            title={isCollapsed ? "展開する" : "折りたたむ"}
          >
            <ChevronDown className="w-4 h-4 text-slate-100" />
          </div>
          <Building2 className="w-4 h-4 text-sky-200" />
          <span 
            className="font-bold text-sm cursor-pointer select-none" 
            onClick={() => toggleDept(dept.id)} 
            title={isCollapsed ? "展開する" : "折りたたむ"}
          >

            {dept.nextName && dept.nextName !== dept.name ? `${dept.name} / ${dept.nextName}` : dept.name}
          </span>
          <span className="text-[10px] bg-slate-400 px-2 py-0.5 rounded text-slate-50 ml-2 shadow-inner pointer-events-none">
            今年度: {formatCountText(cCounts)} / 来年度: {formatCountText(nCounts)}
          </span>
          
          {(onMoveUp || onMoveDown) && (
            <div className="opacity-0 group-hover/dept:opacity-100 flex gap-0.5 ml-2">
              <button 
                onClick={onMoveUp} 
                className={cx("p-0.5 rounded text-slate-200", onMoveUp ? "hover:bg-slate-400 hover:text-white" : "invisible")} 
                title={onMoveUp ? "部署を上に移動" : ""}
              >
                <ArrowUp className="w-4 h-4"/>
              </button>
              <button 
                onClick={onMoveDown} 
                className={cx("p-0.5 rounded text-slate-200", onMoveDown ? "hover:bg-slate-400 hover:text-white" : "invisible")} 
                title={onMoveDown ? "部署を下に移動" : ""}
              >
                <ArrowDown className="w-4 h-4"/>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex gap-1 items-center">
          <div className="opacity-0 group-hover/dept:opacity-100 flex gap-1 items-center">
            <button 
              onClick={() => openModal('post', { deptId: dept.id })} 
              className="px-1.5 py-0.5 bg-slate-600 rounded text-[10px]" 
              title="この部署にポストを追加"
            >
              <UserPlus className="w-3 h-3 inline mr-1"/>ポスト
            </button>
            <button 
              onClick={() => openModal('group', { deptId: dept.id })} 
              className="px-1.5 py-0.5 bg-slate-600 rounded text-[10px]" 
              title="この部署に班を追加"
            >
              <Plus className="w-3 h-3 inline mr-1"/>班
            </button>
            <button 
              onClick={() => openModal('dept', dept)} 
              className="p-1 hover:bg-slate-600 rounded" 
              title="部署名を編集"
            >
              <Edit2 className="w-3 h-3"/>
            </button>
            <button 
              onClick={() => openModal('delConfirm', { type: 'dept', id: dept.id, title: dept.name })} 
              className="p-1 hover:bg-rose-500 text-white rounded" 
              title="部署を削除"
            >
              <Trash2 className="w-3 h-3"/>
            </button>
          </div>
          <div className="w-[32px] flex justify-center border-l border-slate-400 pl-1 ml-1">
            <CommentButton targetId={`dept-${dept.id}`} theme="dark" tooltipPos="left" hoverClass="group-hover/dept:opacity-100" />
          </div>
        </div>
      </div>
      
      {!isCollapsed && (
        <React.Fragment>
          {/* ポスト一覧 */}
          {dept.posts.map((post, pIdx) => {
            const currentArr = dm.posts[post.id].current;
            const nextArr = dm.posts[post.id].next;
            const isCurrConflict = currentArr.length > 1;
            const isNextConflict = nextArr.length > 1;
            
            return getPairs(currentArr, nextArr).map(([curr, nxt, i]) => {
              if (filterLevel > 0) {
                const hasEmp = curr || nxt;
                const currLvl = curr ? getGradeLevel(curr.currentGrade) : 0;
                const nextLvl = nxt ? getGradeLevel(nxt.nextGrade) : 0;
                if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return null;
              }
              
              return (
                <EmployeeRow 
                  key={`${post.id}-${i}`} 
                  rowAnchorId={`postRow-${dept.id}-${post.id}-${i}`} 
                  isFirst={i === 0} 
                  isPost={true} 
                  titleIcon={<Award className="w-3.5 h-3.5 text-sky-600 shrink-0" />} 
                  titleText={post.nextName && post.nextName !== post.name ? `${post.name} / ${post.nextName}` : post.name} 
                  onTitleEdit={() => openModal('post', { deptId: dept.id, post })} 
                  onTitleDelete={() => openModal('delConfirm', { type: 'post', deptId: dept.id, id: post.id, title: post.name })} 
                  onMoveUp={pIdx > 0 ? () => mutations.movePost(dept.id, post.id, 'up') : undefined} 
                  onMoveDown={pIdx < dept.posts.length - 1 ? () => mutations.movePost(dept.id, post.id, 'down') : undefined} 
                  currentEmp={curr} 
                  nextEmp={nxt} 
                  onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, post.id, null, null)} 
                  onNextClick={() => handleCellClick(nxt?.id, false, dept.id, post.id, null, null)} 
                  currentMove={createMoveProps(curr, i, currentArr.length, true, mutations)} 
                  nextMove={createMoveProps(nxt, i, nextArr.length, false, mutations)} 
                  currConflict={isCurrConflict} 
                  nextConflict={isNextConflict} 
                />
              );
            });
          })}
          
          {/* グループ一覧 */}
          {dept.groups.map((grp, gIdx) => {
            const groupData = dm.groups[grp.id];
            console.log('isGroupVisible:', grp.name, filterLevel, isGroupVisible(grp, groupData, filterLevel), groupData);
            if (filterLevel > 0 && !isGroupVisible(grp, groupData, filterLevel)) {
              return null;
            }
            const grpCurrEmps = [...groupData.direct.current];
            const grpNextEmps = [...groupData.direct.next];
            
            Object.values(groupData.posts).forEach(gp => { 
              grpCurrEmps.push(...gp.current); 
              grpNextEmps.push(...gp.next); 
            });
            
            const gCCounts = getCounts(grpCurrEmps, false);
            const gNCounts = getCounts(grpNextEmps, true);
            
            return (
              <React.Fragment key={grp.id}>
                <div className="flex border-b border-slate-400 bg-slate-200 group/grp relative z-10">
                  <div className="w-full px-2 py-1 text-[11px] font-bold text-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-1.5" title={grp.nextName && grp.nextName !== grp.name ? `${grp.name} / ${grp.nextName}` : grp.name}>
                      <Layers className="w-3.5 h-3.5 text-slate-600 ml-2" />
                      {grp.nextName && grp.nextName !== grp.name ? `${grp.name} / ${grp.nextName}` : grp.name}
                      <span className="text-[9px] bg-slate-300/80 px-1.5 py-0.5 rounded text-slate-700 ml-1 font-normal select-none pointer-events-none border border-slate-300">
                        今年度: {formatCountText(gCCounts)} / 来年度: {formatCountText(gNCounts)}
                      </span>
                      
                      {(gIdx > 0 || gIdx < dept.groups.length - 1) && (
                        <div className="opacity-0 group-hover/grp:opacity-100 flex gap-0.5 ml-2">
                          <button 
                            onClick={gIdx > 0 ? () => mutations.moveGroup(dept.id, grp.id, 'up') : undefined} 
                            className={cx("p-0.5 rounded text-slate-500", gIdx > 0 ? "hover:bg-slate-300" : "invisible")} 
                            title={gIdx > 0 ? "班を上に移動" : ""}
                          >
                            <ArrowUp className="w-3.5 h-3.5"/>
                          </button>
                          <button 
                            onClick={gIdx < dept.groups.length - 1 ? () => mutations.moveGroup(dept.id, grp.id, 'down') : undefined} 
                            className={cx("p-0.5 rounded text-slate-500", gIdx < dept.groups.length - 1 ? "hover:bg-slate-300" : "invisible")} 
                            title={gIdx < dept.groups.length - 1 ? "班を下に移動" : ""}
                          >
                            <ArrowDown className="w-3.5 h-3.5"/>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 items-center">
                      <div className="opacity-0 group-hover/grp:opacity-100 flex gap-1 items-center">
                        <button 
                          onClick={() => openModal('groupPost', { deptId: dept.id, groupId: grp.id })} 
                          className="px-1 bg-white rounded text-[10px] border border-slate-300" 
                          title="この班にポストを追加"
                        >
                          班内ポスト
                        </button>
                        <button 
                          onClick={() => openModal('group', { deptId: dept.id, group: grp })} 
                          className="p-0.5 hover:bg-slate-300" 
                          title="班名を編集"
                        >
                          <Edit2 className="w-3 h-3"/>
                        </button>
                        <button 
                          onClick={() => openModal('delConfirm', { type: 'group', deptId: dept.id, id: grp.id, title: grp.name })} 
                          className="p-0.5 hover:bg-rose-200" 
                          title="班を削除"
                        >
                          <Trash2 className="w-3 h-3"/>
                        </button>
                      </div>
                      <div className="w-[32px] flex justify-center border-l border-slate-300 pl-1 ml-1">
                        <CommentButton targetId={`groupHeader-${dept.id}-${grp.id}`} tooltipPos="left" hoverClass="group-hover/grp:opacity-100" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 班内ポスト一覧 */}
                {grp.posts.map((gp, gpIdx) => {
                  const currentArr = dm.groups[grp.id].posts[gp.id].current;
                  const nextArr = dm.groups[grp.id].posts[gp.id].next;
                  const isCurrConflict = currentArr.length > 1;
                  const isNextConflict = nextArr.length > 1;
                  
                  return getPairs(currentArr, nextArr).map(([curr, nxt, i]) => {
                    if (filterLevel > 0) {
                      const hasEmp = curr || nxt;
                      const currLvl = curr ? getGradeLevel(curr.currentGrade) : 0;
                      const nextLvl = nxt ? getGradeLevel(nxt.nextGrade) : 0;
                      if (hasEmp && currLvl < filterLevel && nextLvl < filterLevel) return null;
                    }
                    
                    return (
                      <EmployeeRow 
                        key={`${gp.id}-${i}`} 
                        rowAnchorId={`groupPostRow-${dept.id}-${grp.id}-${gp.id}-${i}`} 
                        isFirst={i === 0} 
                        isIndent={true} 
                        isPost={true} 
                        titleIcon={<Award className="w-3 h-3 text-sky-600 shrink-0" />} 
                        titleText={gp.nextName && gp.nextName !== gp.name ? `${gp.name} / ${gp.nextName}` : gp.name} 
                        onTitleEdit={() => openModal('groupPost', { deptId: dept.id, groupId: grp.id, post: gp })} 
                        onTitleDelete={() => openModal('delConfirm', { type: 'groupPost', deptId: dept.id, groupId: grp.id, id: gp.id, title: gp.name })} 
                        onMoveUp={gpIdx > 0 ? () => mutations.moveGroupPost(dept.id, grp.id, gp.id, 'up') : undefined} 
                        onMoveDown={gpIdx < grp.posts.length - 1 ? () => mutations.moveGroupPost(dept.id, grp.id, gp.id, 'down') : undefined} 
                        currentEmp={curr} 
                        nextEmp={nxt} 
                        onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, grp.id, gp.id)} 
                        onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, grp.id, gp.id)} 
                        currentMove={createMoveProps(curr, i, currentArr.length, true, mutations)} 
                        nextMove={createMoveProps(nxt, i, nextArr.length, false, mutations)} 
                        currConflict={isCurrConflict} 
                        nextConflict={isNextConflict} 
                      />
                    );
                  });
                })}
                
                {/* 班員（一般） */}
                {getPairs(
                  filterDirects(dm.groups[grp.id].direct.current, filterLevel, false), 
                  filterDirects(dm.groups[grp.id].direct.next, filterLevel, true)
                ).map(([curr, nxt, i]) => { 
                  if (!curr && !nxt) return null; 
                  return (
                    <EmployeeRow 
                      key={`direct-${grp.id}-${i}`} 
                      rowAnchorId={`directRow-${dept.id}-${grp.id}-${i}`} 
                      isFirst={i === 0} 
                      isIndent={true} 
                      titleText="班員" 
                      currentEmp={curr} 
                      nextEmp={nxt} 
                      onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, grp.id, null)} 
                      onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, grp.id, null)} 
                      currentMove={createMoveProps(curr, i, dm.groups[grp.id].direct.current.length, true, mutations)} 
                      nextMove={createMoveProps(nxt, i, dm.groups[grp.id].direct.next.length, false, mutations)} 
                    />
                  ); 
                })}
                <AddSlotRow 
                  label="追加枠" 
                  indentClass="ml-9" 
                  anchorId={`addSlot-${dept.id}-${grp.id}`} 
                  onClickNext={() => handleCellClick(null, false, dept.id, null, grp.id, null)} 
                />
              </React.Fragment>
            );
          })}
          
          {/* 課直属（一般） */}
          {getPairs(
            filterDirects(dm.direct.current, filterLevel, false), 
            filterDirects(dm.direct.next, filterLevel, true)
          ).map(([curr, nxt, i]) => { 
            if (!curr && !nxt) return null; 
            return (
              <EmployeeRow 
                key={`dept-direct-${dept.id}-${i}`} 
                rowAnchorId={`deptDirectRow-${dept.id}-${i}`} 
                isFirst={i === 0} 
                titleText="課直属(一般)" 
                currentEmp={curr} 
                nextEmp={nxt} 
                onCurrentClick={() => handleCellClick(curr?.id, true, dept.id, null, null, null)} 
                onNextClick={() => handleCellClick(nxt?.id, false, dept.id, null, null, null)} 
                currentMove={createMoveProps(curr, i, dm.direct.current.length, true, mutations)} 
                nextMove={createMoveProps(nxt, i, dm.direct.next.length, false, mutations)} 
              />
            ); 
          })}
          <AddSlotRow 
            label="直属追加枠" 
            indentClass="ml-4" 
            anchorId={`addSlot-${dept.id}-direct`} 
            onClickNext={() => handleCellClick(null, false, dept.id, null, null, null)} 
          />
        </React.Fragment>
      )}
    </div>
  );
};

