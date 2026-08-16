import React, { useState, useMemo } from 'react';
import { X, GitMerge, List, Award, RotateCcw, FileSpreadsheet, Printer } from 'lucide-react';
import { analyzeChainTransfers, getReason, toReiwa, chunkArray } from '../../utils/chainTransferParser.js';
import { GRADE_TO_PROMO_KEY, GRADE_LEVELS } from '../../constants/config.js';

const COLORS = {
  RETIRING: 'text-[#FF4B00]', // CUD 赤
  RETAINING: 'text-[#03AF7A]', // CUD 緑（青緑）
  NEW: 'text-[#F6AA00]',      // CUD 黄（オレンジ系）
  NEW_HIRE: 'text-[#990099]', // CUD 紫
  TRANSFER: 'text-[#005AFF]'  // CUD 青
};

const getReasonColorClass = (reason) => {
  if (!reason) return '';
  if (reason.includes('退職')) return COLORS.RETIRING;
  if (reason.includes('留任')) return COLORS.RETAINING;
  if (reason.includes('新設')) return COLORS.NEW;
  if (reason.includes('新採')) return COLORS.NEW_HIRE;
  if (reason.includes('転任') || reason.includes('異動')) return COLORS.TRANSFER;
  return 'text-gray-800';
};

const formatPostInfo = (post) => {
  if (['retired', 'unassigned'].includes(post.type)) return <span>{post.label}</span>;
  return <><span className="text-gray-700">{post.dept}</span><span>{post.title}</span></>;
};

const getDisplayName = (move) => {
  let prefix = move.isPromotedToFukuShunin ? "E! " : 
               move.isPromotedToShocho ? "! " : 
               move.isPromoted ? "*! " : 
               move.isTitleChanged ? "! " : "";
  return prefix + move.emp.name + (move.promotedSuffix || "");
};

const sortData = (rows, sortKey, sortOrder) => {
  if (!sortKey) return rows;
  return [...rows].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];

    const isEmptyA = (valA === '' || valA == null);
    const isEmptyB = (valB === '' || valB == null);
    if (isEmptyA && !isEmptyB) return 1;
    if (!isEmptyA && isEmptyB) return -1;
    if (isEmptyA && isEmptyB) return 0;

    const numA = Number(valA);
    const numB = Number(valB);

    let cmp = 0;
    if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
      cmp = numA - numB;
    } else {
      cmp = String(valA).localeCompare(String(valB), 'ja');
    }

    return sortOrder === 'asc' ? cmp : -cmp;
  });
};

export const ChainTransferModal = ({ isOpen, onClose, employees, departments, targetYear, currentFileName }) => {
  const [currentTab, setCurrentTab] = useState('chain');
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [chainSortOrder, setChainSortOrder] = useState(null);
  const [designatedSortKey, setDesignatedSortKey] = useState(null);
  const [designatedSortOrder, setDesignatedSortOrder] = useState('asc');

  const calculateGradeYears = (emp, targetYear) => {
    if (!emp || !emp.currentGrade) return '';
    const promoKey = GRADE_TO_PROMO_KEY[emp.currentGrade];
    if (!promoKey) return '';
    const promoYear = Number(emp[promoKey]);
    if (!promoYear || isNaN(promoYear)) return '';
    return Math.max(0, targetYear - promoYear);
  };

  const data = useMemo(() => {
    if (!isOpen) return null;
    return analyzeChainTransfers(employees, departments, targetYear);
  }, [isOpen, employees, departments, targetYear]);

  if (!isOpen || !data) return null;

  const { chains, movesByToPost, movesByFromPost, moves, retentions } = data;


  const handlePrint = (e) => {
    // Print the window where the event occurred (useful if rendered in a Portal/new window)
    const targetWindow = e?.currentTarget?.ownerDocument?.defaultView || window;
    targetWindow.print();
  };

  const isDesignated = (grade, title) => {
    const g = String(grade || ''), t = String(title || '');
    const isHosa1 = g.includes('補佐級I') || g.includes('補佐級Ⅰ') || g.includes('主任');
    if (g.includes('補佐級') && !isHosa1) return true;
    if (g.includes('課長級') || g.includes('所属長級') || g.includes('次長級') || g.includes('部長級') || g.includes('指定職')) return true;
    if (['局長', '次長', '課長', '参事', '部長', '場長', '班長', '専門技術員', '企画員', '主幹'].some(k => t.includes(k))) return true;
    return false;
  };

  const tabs = [
    { id: 'chain', icon: <GitMerge className="w-4 h-4" />, label: 'つなぎ表' },
    { id: 'list', icon: <List className="w-4 h-4" />, label: '異動案リスト' },
    { id: 'designated', icon: <Award className="w-4 h-4" />, label: '指定職人事異動' }
  ];

  const hasSort = (currentTab === 'chain' && !!chainSortOrder) || 
                  (currentTab === 'list' && !!sortKey) || 
                  (currentTab === 'designated' && !!designatedSortKey);

  const handleResetSort = () => {
    if (currentTab === 'chain') setChainSortOrder(null);
    else if (currentTab === 'list') { setSortKey(null); setSortOrder('asc'); }
    else if (currentTab === 'designated') { setDesignatedSortKey(null); setDesignatedSortOrder('asc'); }
  };

  const renderTh = (label, key, sortHandler, isDesig = false, extraClass = '', rowspan = '') => {
    const currentSortKey = isDesig ? designatedSortKey : sortKey;
    const currentSortOrder = isDesig ? designatedSortOrder : sortOrder;
    const isSorted = currentSortKey === key;
    const plainTextLabel = label.replace(/<[^>]*>?/gm, '');

    let sortIcon = <span className="inline-flex"><span className="w-3 h-3 text-gray-300">↕</span></span>;
    if (isSorted) {
      sortIcon = currentSortOrder === 'asc' 
        ? <span className="inline-flex"><span className="w-3 h-3 text-blue-600">↑</span></span>
        : <span className="inline-flex"><span className="w-3 h-3 text-blue-600">↓</span></span>;
    }

    let bgClass = extraClass;
    if (isSorted) {
       bgClass = extraClass.replace(/bg-[a-zA-Z0-9/-]+/g, '').trim() + ' bg-blue-50';
    } else if (!bgClass.includes('bg-')) {
       bgClass += ' bg-white';
    }

    return (
      <th 
        key={key} 
        rowSpan={rowspan || undefined}
        className={`${isDesig ? 'border-r border-b border-black px-1.5 py-1.5' : 'border-r border-black px-1.5 py-2'} font-normal cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors select-none group ${bgClass}`}
        onClick={() => sortHandler(key)}
        title={`${plainTextLabel}で並べ替え`}
      >
        <div className="flex items-center justify-between gap-1">
          <span dangerouslySetInnerHTML={{ __html: label }}></span>
          {sortIcon}
        </div>
      </th>
    );
  };

  const renderChainTable = () => {
    let displayChains = [...chains];
    if (chainSortOrder) {
      displayChains.sort((a, b) => {
        const reasonA = getReason(a, movesByFromPost) || '';
        const reasonB = getReason(b, movesByFromPost) || '';
        const nameA = a[0]?.emp?.name || '';
        const nameB = b[0]?.emp?.name || '';
        
        let cmp = reasonA.localeCompare(reasonB, 'ja');
        if (cmp === 0) cmp = nameA.localeCompare(nameB, 'ja');
        return chainSortOrder === 'asc' ? cmp : -cmp;
      });
    }

    const MAX_COLS = 4;
    
    return (
      <div className="bg-white">
        <div className="mb-2"><div className="text-lg font-bold tracking-widest">つなぎ表</div></div>
        <div className="overflow-auto border-t-[3px] border-black max-h-[calc(100vh-220px)] print:max-h-none print:overflow-visible">
          <table className="border-collapse w-full min-w-max bg-white text-black relative">
            <thead className="sticky top-0 z-10 shadow-[0_2px_0_0_black] print:static print:shadow-none print:border-b-2 print:border-black">
              <tr>
                <th className={`border-r border-black px-2 py-1.5 text-center font-normal w-24 text-[13px] bg-clip-padding cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors select-none group ${chainSortOrder ? 'bg-blue-50' : 'bg-white'}`}
                    onClick={() => setChainSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')} title="事由・氏名で並べ替え">
                  <div className="flex items-center justify-between gap-1">
                    <span>事由・氏名</span>
                    <span className="inline-flex">
                      {chainSortOrder === 'asc' ? <span className="w-3 h-3 text-blue-600">↑</span> : chainSortOrder === 'desc' ? <span className="w-3 h-3 text-blue-600">↓</span> : <span className="w-3 h-3 text-gray-300">↕</span>}
                    </span>
                  </div>
                </th>
                {Array.from({ length: MAX_COLS }).map((_, i) => (
                  <th key={i} className="border-r border-black px-2 py-1.5 text-center font-normal w-40 min-w-[10rem] text-[13px] bg-white bg-clip-padding"></th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayChains.map((chain, chainIdx) => {
                const firstMove = chain[0];
                const lastMove = chain[chain.length - 1];
                const isLastEmpty = !(movesByToPost[lastMove.fromPostId]?.length) && lastMove.fromPost.type !== 'unassigned';
                const isRetired = firstMove.toPost.type === 'retired';
                
                const cells = [];
                chain.forEach((move, i) => {
                  if (isRetired && i === 0) return;
                  cells.push({ type: 'move', move, showArrow: isRetired ? true : i > 0 });
                });
                if (isLastEmpty) cells.push({ type: 'empty', move: lastMove });
                if (cells.length === 0) cells.push({ type: 'placeholder' });

                const chunks = chunkArray(cells, MAX_COLS);
                const reason = getReason(chain, movesByFromPost);

                return chunks.map((chunk, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === chunks.length - 1;
                  const reasonColor = getReasonColorClass(reason);

                  return (
                    <tr key={`${chainIdx}-${idx}`} className={`border-black print-break-inside-avoid ${isLast ? 'border-b-2' : 'border-b'}`}>
                      {isFirst ? (
                        <td className="border-r border-black px-1 py-3 text-center align-top relative bg-gray-50/40 min-w-[7rem]" rowSpan={chunks.length}>
                          <div className={`text-[12px] font-bold mb-3 pb-1 border-b border-gray-400 border-dashed inline-block px-1 ${reasonColor}`}>{reason}</div>
                          <div className="text-[11px] leading-snug flex flex-col justify-start">
                            <span className="text-gray-600">{(isRetired ? firstMove.fromPost : firstMove.toPost).dept || ''}</span>
                            <span className="text-gray-800 font-medium">{(isRetired ? firstMove.fromPost : firstMove.toPost).title || ''}</span>
                          </div>
                          {isRetired && (
                            <div className="text-[12px] tracking-wider font-bold mt-2 pt-2 border-t border-gray-300 border-dashed">
                              {getDisplayName(firstMove)}
                            </div>
                          )}
                        </td>
                      ) : null}
                      
                      {chunk.map((cell, cIdx) => {
                        if (cell.type === 'move') {
                          return (
                            <td key={cIdx} className="border-r border-black px-2 py-2 text-center align-top relative">
                              {cell.showArrow && <div className="absolute top-1/2 left-1 -translate-y-1/2 z-10 text-[15px] font-sans">←</div>}
                              <div className="text-[11px] leading-snug mb-3 min-h-[2.5em] flex flex-col justify-end">{formatPostInfo(cell.move.toPost)}</div>
                              <div className="text-[14px] tracking-widest font-bold my-1 border-t border-b border-dashed border-gray-300 py-1">{getDisplayName(cell.move)}</div>
                              <div className="text-[11px] leading-snug mt-3 min-h-[2.5em] flex flex-col justify-start">{formatPostInfo(cell.move.fromPost)}</div>
                            </td>
                          );
                        }
                        if (cell.type === 'empty') {
                          return (
                            <td key={cIdx} className="border-r border-black px-2 py-2 text-center align-middle relative bg-gray-50/50">
                              <div className="absolute top-1/2 left-1 -translate-y-1/2 z-10 text-[15px] font-sans text-gray-500">←</div>
                              <div className={`text-[12px] ${COLORS.RETIRING} mb-2 tracking-widest font-bold`}>廃止</div>
                              <div className="text-[11px] leading-snug">
                                <div className="text-gray-500">{cell.move.fromPost.fullDept || cell.move.fromPost.dept}</div>
                                <div className="text-gray-700">{cell.move.fromPost.title}</div>
                              </div>
                            </td>
                          );
                        }
                        return null;
                      })}

                      {Array.from({ length: MAX_COLS - chunk.filter(c => c.type !== 'placeholder').length }).map((_, eIdx) => (
                        <td key={`empty-${eIdx}`} className="border-r border-black px-2 py-2"></td>
                      ))}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderListTable = () => {
    let listRows = [];
    const usedToMoves = new Set();
    
    moves.forEach(move => {
      if (move.fromPost.type === 'unassigned') return;
      const incomingMoves = (movesByToPost[move.fromPostId] || []).filter(m => !usedToMoves.has(m));
      let successor = null;
      if (incomingMoves.length > 0) {
        successor = incomingMoves[0];
        usedToMoves.add(successor);
      }
      const reason = move.toPost.type === 'retired' ? '退職' : `異動<br>(${move.toPost.label})`;
      listRows.push({ predecessor: move, successor, reason });
    });

    moves.forEach(move => {
      if (!usedToMoves.has(move)) {
        listRows.push({
          predecessor: null, successor: move,
          reason: move.fromPost.type === 'unassigned' ? '新採' : '新設'
        });
      }
    });

    listRows = listRows.map(row => {
      const pred = row.predecessor?.emp || {};
      const succ = row.successor?.emp || {};
      const predPost = row.predecessor?.fromPost || row.successor?.toPost || {};
      const succPost = row.successor?.fromPost || {};
      
      let succName = succ.name || (row.predecessor && !row.successor ? '【 廃 止 】' : '');
      if (row.successor && succPost.type === 'unassigned') succName = '新採 ' + succName;
      
      const isPromoted = row.successor?.isPromoted || row.successor?.isPromotedToFukuShunin || row.successor?.isPromotedToShocho ? '○' : '';
      const getEmpNo = (emp) => {
        const no = emp.employeeNumber || emp.employeeId || emp['職員番号'] || emp.id || '';
        const str = String(no).trim();
        return /[a-zA-Z_\-]/.test(str) ? '' : str;
      };

      return {
        predDeptTitle: (predPost.dept || '') + (predPost.title || ''),
        predGroup: predPost.group || '',
        predEmpNo: getEmpNo(pred),
        predName: pred.name || '',
        predAge: pred.ageNextYear ?? pred.age ?? '',
        reason: row.reason,
        currentYears: pred.currentYears || pred.yearsInCurrentPost || '',
        succEmpNo: getEmpNo(succ),
        succName,
        isPromoted,
        succAge: succ.ageNextYear ?? succ.age ?? '',
        succPostLabel: succPost.label || '',
        noteStr: succ.note || pred.note || ''
      };
    });

    listRows = sortData(listRows, sortKey, sortOrder);

    const targetYearR = toReiwa(targetYear);
    const prevYearR = targetYearR - 1;

    const cols = [
      { label: '所属・職名', key: 'predDeptTitle', cls: 'text-left' },
      { label: '班係', key: 'predGroup', cls: 'text-left' },
      { label: '職員番号', key: 'predEmpNo', cls: 'text-center min-w-[5rem] w-20 leading-tight' },
      { label: '氏名', key: 'predName', cls: 'text-left' },
      { label: `年齢<br>R${targetYearR}.4.1`, key: 'predAge', cls: 'text-center leading-tight' },
      { label: '事由', key: 'reason', cls: 'text-left' },
      { label: '現所属<br>年数', key: 'currentYears', cls: 'text-center leading-tight' },
      { label: '後任者<br>職員番号', key: 'succEmpNo', cls: 'text-center min-w-[5rem] w-20 leading-tight' },
      { label: '後任者 氏名', key: 'succName', cls: 'text-left leading-tight' },
      { label: '昇任<br>昇格', key: 'isPromoted', cls: 'text-center leading-tight' },
      { label: `年齢<br>R${targetYearR}.4.1`, key: 'succAge', cls: 'text-center leading-tight' },
      { label: `R${prevYearR}年度所属・職名`, key: 'succPostLabel', cls: 'text-left leading-tight' },
      { label: '特記事項', key: 'noteStr', cls: 'text-left' }
    ];

    const handleSortClick = (key) => {
      let newOrder = 'asc';
      if (sortKey === key) newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortKey(key); setSortOrder(newOrder);
    };

    return (
      <div className="bg-white">
        <div className="mb-2"><div className="text-lg font-bold tracking-widest">異動案リスト</div></div>
        <div className="overflow-auto border-t-[3px] border-black max-h-[calc(100vh-220px)] print:max-h-none print:overflow-visible">
          <table className="border-collapse w-full min-w-max bg-white text-black border-b-2 border-black text-[12px]">
            <thead className="sticky top-0 z-10 shadow-[0_2px_0_0_black] print:static print:shadow-none print:border-b-2 print:border-black bg-white">
              <tr>
                {cols.map(c => renderTh(c.label, c.key, handleSortClick, false, c.cls))}
              </tr>
            </thead>
            <tbody>
              {listRows.map((r, i) => {
                const reasonColor = getReasonColorClass(r.reason);
                const succNameClass = r.succName === '【 廃 止 】' ? `${COLORS.RETIRING} font-bold` : '';
                return (
                  <tr key={i} className="border-b border-gray-400 text-[11px] hover:bg-gray-50 print-break-inside-avoid">
                    <td className="border-r border-black p-1.5 max-w-[120px] break-words">{r.predDeptTitle}</td>
                    <td className="border-r border-black p-1.5 max-w-[100px] break-words">{r.predGroup}</td>
                    <td className="border-r border-black p-1.5 text-center min-w-[5rem] w-20">{r.predEmpNo}</td>
                    <td className="border-r border-black p-1.5 whitespace-nowrap">{r.predName}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.predAge}</td>
                    <td className={`border-r border-black p-1.5 max-w-[120px] break-words font-bold ${reasonColor}`} dangerouslySetInnerHTML={{ __html: r.reason }}></td>
                    <td className="border-r border-black p-1.5 text-center whitespace-nowrap">{r.currentYears ? r.currentYears + '年' : ''}</td>
                    <td className="border-r border-black p-1.5 text-center min-w-[5rem] w-20">{r.succEmpNo}</td>
                    <td className={`border-r border-black p-1.5 whitespace-nowrap ${succNameClass}`}>{r.succName}</td>
                    <td className={`border-r border-black p-1.5 text-center ${COLORS.RETIRING} font-bold`}>{r.isPromoted}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.succAge}</td>
                    <td className="border-r border-black p-1.5 max-w-[140px] break-words">{r.succPostLabel}</td>
                    <td className="p-1.5 max-w-[140px] break-words">{r.noteStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDesignatedTable = () => {
    let desigRows = [];
    const usedToMoves = new Set();
    
    const getDisplayGrade = (gradeStr) => {
      const g = String(gradeStr || '');
      if (g.includes('補佐級I') || g.includes('補佐級Ⅰ') || g.includes('係長級') || g.includes('主任') || g.includes('主査')) return '';
      return g;
    };
    
    moves.forEach(move => {
      if (move.fromPost.type === 'unassigned' || move.fromPost.type === 'retired') return;
      const isFromDesig = isDesignated(move.emp.currentGrade, move.fromPost.title);
      
      const incomingMoves = (movesByToPost[move.fromPostId] || []).filter(m => !usedToMoves.has(m));
      let successor = null;
      if (incomingMoves.length > 0) {
        successor = incomingMoves[0];
        usedToMoves.add(successor);
      }
      const isToDesig = successor ? isDesignated(successor.emp.nextGrade, successor.toPost.title) : false;

      if (isFromDesig || isToDesig) {
         desigRows.push({
           postLabel: (move.fromPost.fullDept || move.fromPost.dept) + ' ' + (move.fromPost.title || ''),
           gradeLabel: getDisplayGrade(move.emp.currentGrade),
           predecessor: move, successor
         });
      }
    });

    moves.forEach(move => {
      if (!usedToMoves.has(move)) {
        if (move.toPost.type === 'retired' || move.toPost.type === 'unassigned') return;
        if (isDesignated(move.emp.nextGrade, move.toPost.title)) {
          desigRows.push({
            postLabel: (move.toPost.fullDept || move.toPost.dept) + ' ' + (move.toPost.title || ''),
            gradeLabel: getDisplayGrade(move.emp.nextGrade),
            predecessor: null, successor: move
          });
        }
      }
    });

    retentions.forEach(move => {
      if (isDesignated(move.emp.currentGrade, move.fromPost.title) || isDesignated(move.emp.nextGrade, move.toPost.title)) {
         desigRows.push({
           postLabel: (move.fromPost.fullDept || move.fromPost.dept) + ' ' + (move.fromPost.title || ''),
           gradeLabel: getDisplayGrade(move.emp.currentGrade),
           predecessor: move, successor: move, isRetention: true
         });
      }
    });

    desigRows = desigRows.map(row => {
      const isRetention = row.isRetention;
      const pred = row.predecessor?.emp || {};
      const succ = row.successor?.emp || {};
      const succPost = row.successor?.fromPost || {};
      
      const getEmpNo = (emp) => {
        const no = emp.employeeNumber || emp.employeeId || emp['職員番号'] || emp.id || '';
        const str = String(no).trim();
        return /[a-zA-Z_\-]/.test(str) ? '' : str;
      };

      const predEmpNo = getEmpNo(pred);
      const succEmpNo = getEmpNo(succ);
      
      let predReason = isRetention ? '留任' : (row.predecessor ? (row.predecessor.toPost.type === 'retired' ? '退職' : '転任') : '新設');
      
      let succRemark = '';
      if (row.successor) {
        const cGrade = row.successor.emp.currentGrade || '';
        const nGrade = row.successor.emp.nextGrade || '';
        const getBaseGrade = (gradeStr) => {
          if (gradeStr.includes('部長級')) return '部長級';
          if (gradeStr.includes('次長級')) return '次長級';
          if (gradeStr.includes('所属長級') || gradeStr.includes('課長級')) return '課長級';
          if (gradeStr.includes('補佐級')) return '補佐級';
          return gradeStr; 
        };
        const gradeLevels = { '補佐級': 1, '課長級': 2, '次長級': 3, '部長級': 4 };
        const cBase = getBaseGrade(cGrade), nBase = getBaseGrade(nGrade);
        const cLevel = gradeLevels[cBase] || 0, nLevel = gradeLevels[nBase] || 0;

        if (cGrade !== nGrade && nGrade !== '') {
           succRemark = (nLevel > cLevel && ['部長級', '次長級', '課長級', '補佐級'].includes(nBase)) ? '昇任' : '昇格';
        } else if (row.successor.isTitleChanged) {
           succRemark = '昇格';
        }
      }
      // Removed noteStr from succRemark as requested

      let displaySuccName = '', displaySuccAge = '', displaySuccCurrentYears = '', displaySuccGradeYears = '', displaySuccPostLabel = '';

      if (!isRetention) {
         displaySuccName = succ.name || (row.predecessor && !row.successor ? '【 廃 止 】' : '');
         if (row.successor && succPost.type === 'unassigned') displaySuccName = '新採 ' + displaySuccName;
         displaySuccAge = succ.ageNextYear ?? succ.age ?? '';
         displaySuccCurrentYears = row.successor ? '1' : ''; 
         displaySuccGradeYears = succ ? calculateGradeYears(succ, targetYear) : '';
         displaySuccPostLabel = succPost.type === 'unassigned' ? '' : ((succPost.fullDept || succPost.dept || '') + ' ' + (succPost.title || ''));
      }

      return {
        postLabel: row.postLabel,
        gradeLabel: row.gradeLabel,
        predName: pred.name || '',
        predAge: pred.ageNextYear ?? pred.age ?? '',
        predCurrentYears: pred.currentYears || pred.yearsInCurrentPost || '',
        predGradeYears: pred ? calculateGradeYears(pred, targetYear) : '',
        predReason: predReason,
        succName: displaySuccName,
        succAge: displaySuccAge,
        succCurrentYears: displaySuccCurrentYears,
        succGradeYears: displaySuccGradeYears,
        succPostLabel: displaySuccPostLabel,
        succRemark: succRemark
      };
    });

    // Apply default sorting
    desigRows.sort((a, b) => {
      const levelA = GRADE_LEVELS[a.gradeLabel] || 0;
      const levelB = GRADE_LEVELS[b.gradeLabel] || 0;
      if (levelA !== levelB) {
        return levelB - levelA; // Descending (higher grade first)
      }
      const gyA = Number(a.predGradeYears) || 0;
      const gyB = Number(b.predGradeYears) || 0;
      return gyB - gyA; // Descending (longer years first)
    });

    desigRows = sortData(desigRows, designatedSortKey, designatedSortOrder);

    const targetYearR = toReiwa(targetYear);
    const prevYearR = targetYearR - 1;

    const today = new Date();
    const currentConfigTitle = `令和${prevYearR}年度配置（R${toReiwa(today.getFullYear())}.${today.getMonth() + 1}.${today.getDate()}現在）`;

    const handleSortClick = (key) => {
      let newOrder = 'asc';
      if (designatedSortKey === key) newOrder = designatedSortOrder === 'asc' ? 'desc' : 'asc';
      setDesignatedSortKey(key); setDesignatedSortOrder(newOrder);
    };

    const headerColsTop = [
      { label: '所属・職名', key: 'postLabel', cls: 'text-left min-w-[120px]', rowspan: '2' }
    ];

    const headerColsBottom = [
      { label: `R${prevYearR}年度<br>格付`, key: 'gradeLabel', cls: 'text-center min-w-[60px] bg-gray-50 leading-tight' },
      { label: '氏名', key: 'predName', cls: 'text-center bg-gray-50' },
      { label: `年齢<br>R${targetYearR}.4.1`, key: 'predAge', cls: 'text-center bg-gray-50' },
      { label: `現職年数<br>R${targetYearR}.3.31`, key: 'predCurrentYears', cls: 'text-center bg-gray-50' },
      { label: `現格付年数<br>R${targetYearR}.3.31`, key: 'predGradeYears', cls: `text-center bg-[#03AF7A]/10 ${COLORS.RETAINING} font-bold` },
      { label: '氏名', key: 'succName', cls: 'text-center bg-gray-50' },
      { label: `年齢<br>R${targetYearR}.4.1`, key: 'succAge', cls: 'text-center bg-gray-50' },
      { label: `現職年数<br>R${targetYearR}.3.31`, key: 'succCurrentYears', cls: 'text-center bg-gray-50' },
      { label: `現格付年数<br>R${targetYearR}.3.31`, key: 'succGradeYears', cls: `text-center bg-[#03AF7A]/10 ${COLORS.RETAINING} font-bold` },
      { label: `R${prevYearR}年度<br>現所属`, key: 'succPostLabel', cls: 'text-left min-w-[120px]' },
      { label: '備考', key: 'succRemark', cls: 'text-left min-w-[80px]' }
    ];

    return (
      <div className="bg-white">
        <div className="mb-2 flex justify-between items-center no-print">
          <div className="text-lg font-bold tracking-widest">指定職人事異動様式</div>
        </div>
        
        <div className="overflow-auto border-t-[3px] border-black max-h-[calc(100vh-220px)] print:max-h-none print:overflow-visible">
          <table className="border-collapse w-full min-w-max bg-white text-black border-b-2 border-black text-[11px]">
            <thead className="sticky top-0 z-10 bg-white">
              <tr>
                {headerColsTop.map(c => renderTh(c.label, c.key, handleSortClick, true, c.cls, c.rowspan))}
                <th colSpan="5" className="border-r border-b border-black px-1.5 py-1.5 font-normal text-center bg-gray-50">{currentConfigTitle}</th>
                {renderTh(`R${targetYearR}<br>異動案`, 'predReason', handleSortClick, true, 'text-center bg-blue-100/50', '2')}
                <th colSpan="6" className="border-r border-b border-black px-1.5 py-1.5 font-normal text-center bg-gray-50">令和{targetYearR}年度配置（案）</th>
              </tr>
              <tr>
                {headerColsBottom.map(c => renderTh(c.label, c.key, handleSortClick, true, c.cls))}
              </tr>
            </thead>
            <tbody>
              {desigRows.map((r, i) => {
                const reasonColor = getReasonColorClass(r.predReason);
                const succNameClass = r.succName === '【 廃 止 】' ? `${COLORS.RETIRING} font-bold` : '';
                return (
                  <tr key={i} className="border-b border-gray-400 hover:bg-gray-50 print-break-inside-avoid">
                    <td className="border-r border-black p-1.5 break-words font-bold">{r.postLabel}</td>
                    <td className="border-r border-black p-1.5 text-center whitespace-nowrap">{r.gradeLabel}</td>
                    <td className="border-r border-black p-1.5 whitespace-nowrap">{r.predName}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.predAge}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.predCurrentYears}</td>
                    <td className={`border-r border-black p-1.5 text-center font-bold ${COLORS.RETAINING} bg-[#03AF7A]/10`}>{r.predGradeYears}</td>
                    <td className={`border-r border-black p-1.5 text-center font-bold bg-blue-50/50 ${reasonColor}`}>{r.predReason}</td>
                    <td className={`border-r border-black p-1.5 whitespace-nowrap ${succNameClass}`}>{r.succName}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.succAge}</td>
                    <td className="border-r border-black p-1.5 text-center">{r.succCurrentYears}</td>
                    <td className={`border-r border-black p-1.5 text-center font-bold ${COLORS.RETAINING} bg-[#03AF7A]/10`}>{r.succGradeYears}</td>
                    <td className="border-r border-black p-1.5 break-words">{r.succPostLabel}</td>
                    <td className={`p-1.5 break-words ${COLORS.RETIRING} font-bold`}>{r.succRemark}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col font-sans text-black overflow-hidden print:static print:bg-white print:overflow-visible">
      {/* Header */}
      <header className="bg-white border-b border-gray-300 shadow-sm shrink-0 print:border-none print:shadow-none">
        <div className="w-full px-4 sm:px-8 h-14 flex items-center justify-between print:h-auto print:py-2 print:px-0">
          <div className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-gray-700 print:hidden" />
            <h1 className="text-lg font-bold text-gray-800 print:text-xl">
              {targetYear}年度(R{toReiwa(targetYear)})人事異動案{currentFileName ? `（${currentFileName}）` : ''}
            </h1>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <button onClick={handlePrint} className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white px-3 py-1.5 rounded text-sm transition-colors">
              <Printer className="w-4 h-4" />印刷 / PDF化
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4 sm:p-8 w-full print:p-0 print:overflow-visible">
        {/* Tabs */}
        <div className="flex justify-between items-end border-b-2 border-gray-300 mb-4 no-print">
          <div className="flex gap-1.5">
            {tabs.map(t => (
              <button 
                key={t.id}
                onClick={() => setCurrentTab(t.id)} 
                className={`px-5 py-2.5 text-sm font-bold rounded-t-lg transition-colors flex items-center gap-1.5 ${currentTab === t.id ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <button 
            onClick={handleResetSort} 
            disabled={!hasSort} 
            className={`flex items-center gap-1.5 text-xs transition-colors px-2.5 py-1.5 rounded border mb-1.5 mr-1 ${hasSort ? 'text-gray-700 hover:text-black bg-white hover:bg-gray-100 border-gray-300 cursor-pointer shadow-sm' : 'text-gray-400 bg-gray-50 border-gray-200 cursor-not-allowed opacity-70'}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />並べ替えリセット
          </button>
        </div>

        {/* Tab Content */}
        {currentTab === 'chain' && renderChainTable()}
        {currentTab === 'list' && renderListTable()}
        {currentTab === 'designated' && renderDesignatedTable()}
      </main>

      {/* Print Style Injections */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background-color: white; overflow: visible !important; }
          .no-print { display: none !important; }
          .print-break-inside-avoid { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};
