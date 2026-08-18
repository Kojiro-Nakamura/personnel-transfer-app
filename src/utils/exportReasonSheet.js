export const addReasonSheet = (workbook, sheetName, targetYear, departments, deptMap, currMap, nextMap, employees, notes) => {
  notes = notes || [];
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  // Calculate logic
  const deptStats = {};
  
  // Initialize departments
  departments.forEach(d => {
    deptStats[d.id] = { name: d.name, currCount: 0, nextCount: 0, incReasons: [], decReasons: [] };
  });
  
  // Helper to categorize employee
  const isIncludedInCounts = (emp) => {
    const note = emp.note || '';
    if (note.includes('時短') || note.includes('再短')) return false; // 再任用(短) excluded
    if (note.includes('臨任')) return false; // 臨時的任用 excluded
    if (note.includes('育休代替')) return false; // 育休代替 excluded
    return true; // Include regular, 再フル, etc.
  };

  employees.forEach(emp => {
    const cDept = emp.currentDeptId;
    const nDept = emp.departmentId;
    
    // Determine counts
    if (cDept && cDept !== 'unassigned' && cDept !== 'retired' && deptStats[cDept]) {
      if (isIncludedInCounts(emp)) deptStats[cDept].currCount++;
    }
    if (nDept && nDept !== 'unassigned' && nDept !== 'retired' && deptStats[nDept]) {
      if (isIncludedInCounts(emp)) deptStats[nDept].nextCount++;
    }

    // Determine movements
    if (cDept !== nDept) {
      const isRetiring = !nDept || nDept === 'retired';
      const isNewHire = !cDept || cDept === 'unassigned';
      
      // Leaving old department
      if (cDept && cDept !== 'unassigned' && cDept !== 'retired' && deptStats[cDept]) {
        let reason = '';
        if (isRetiring) {
          reason = '退職';
        } else if (nDept && deptStats[nDept]) {
          reason = deptStats[nDept].name + 'への異動';
        } else {
          reason = '他への異動';
        }
        deptStats[cDept].decReasons.push(reason);
      }
      
      // Entering new department
      if (nDept && nDept !== 'unassigned' && nDept !== 'retired' && deptStats[nDept]) {
        let reason = '';
        if (isNewHire) {
          reason = '新規採用';
        } else if (cDept && deptStats[cDept]) {
          reason = deptStats[cDept].name + 'からの異動';
        } else {
          reason = '他からの異動';
        }
        deptStats[nDept].incReasons.push(reason);
      }
    }
  });

  const aggregateReasons = (reasonsArray) => {
    const counts = {};
    reasonsArray.forEach(r => {
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts).map(([r, count]) => r + ' ' + count + '名').join('、');
  };

  // Build sheet rows
  ws.columns = [
    { header: '所属名', key: 'deptName', width: 25 },
    { header: (targetYear - 1) + '年度現員数 4/1時点', key: 'currCount', width: 25 },
    { header: targetYear + '年度 配置予定数', key: 'nextCount', width: 25 },
    { header: '増減数', key: 'diff', width: 10 },
    { header: '増減理由', key: 'reason', width: 80 }
  ];

  // Title Row
  ws.insertRow(1, ['〇所属毎の増減理由']);
  ws.mergeCells('A1:C1');
  ws.getCell('A1').font = { name: 'BIZ UDPGothic', size: 12, bold: true };
  
  ws.insertRow(2, ['', '', '', '令和' + (targetYear - 2018) + '年']); // Simplified date
  
  // Header styling
  ws.getRow(3).values = ws.columns.map(c => c.header);
  ws.getRow(3).font = { name: 'BIZ UDPGothic', size: 10, bold: true };
  ws.getRow(3).alignment = { horizontal: 'center', vertical: 'middle' };

  let rowIdx = 4;
  let totalCurr = 0;
  let totalNext = 0;

  departments.forEach(d => {
    const stats = deptStats[d.id];
    if (stats.currCount > 0 || stats.nextCount > 0) {
      const diff = stats.nextCount - stats.currCount;
      const incStr = aggregateReasons(stats.incReasons);
      const decStr = aggregateReasons(stats.decReasons);
      
      let reasonText = [];
      if (incStr) reasonText.push('【増要素】' + incStr);
      if (decStr) reasonText.push('【減要素】' + decStr);
      
      // Pulling memo if requested
      const dNote = notes.find(n => n.targetId === 'dept-' + d.id);
      if (dNote && dNote.text) {
         reasonText.push('(参考) ' + dNote.text);
      }

      const row = ws.addRow({
        deptName: d.name,
        currCount: stats.currCount,
        nextCount: stats.nextCount,
        diff: diff,
        reason: reasonText.join('\n')
      });
      
      row.alignment = { wrapText: true, vertical: 'middle' };
      totalCurr += stats.currCount;
      totalNext += stats.nextCount;
      rowIdx++;
    }
  });

  // Total row
  const totalRow = ws.addRow({
    deptName: '合　計',
    currCount: totalCurr,
    nextCount: totalNext,
    diff: totalNext - totalCurr,
    reason: ''
  });
  totalRow.font = { bold: true };

  // Apply borders
  for (let i = 3; i <= rowIdx; i++) {
    const row = ws.getRow(i);
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      cell.font = { name: 'BIZ UDPGothic', size: 10 };
    });
  }

  // Footer notes
  ws.addRow([]);
  ws.addRow(['★', 'R' + (targetYear - 1 - 2018) + '年度またはR' + (targetYear - 2018) + '年度に配置されている所属すべてについて記載してください。（増減が無い所属も含みます）']);
  ws.addRow(['★', '増減理由については、相殺せず、増要素と減要素をそれぞれ計上し、個々の理由を詳細に記載して下さい。']);
  ws.addRow(['★', '再任用(フル)、副主任、一般任期付職員(ポスト職のみ)、国からの割愛派遣職員は含み、再任用(短)、臨時的任用職員、育休代替職員等は含みません。']);
  const noteRow = ws.addRow(['', '異動案リストでは再任用職員を含めませんが、本様式では再任用(フルのみ)を含みますのでご注意ください。']);
  noteRow.getCell(2).font = { color: { argb: 'FFFF0000' } }; // Red font
};
