import { generateReasonStats } from './reasonUtils.js';

export const addReasonSheet = (workbook, sheetName, targetYear, departments, deptMap, currMap, nextMap, employees, notes) => {
  const ws = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }],
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });

  const statsList = generateReasonStats(departments, employees, notes);

  // Build sheet rows
  ws.columns = [
    { header: '所属名', key: 'deptName', width: 25 },
    { header: (targetYear - 1) + '年度現員数 4/1時点', key: 'currCount', width: 25 },
    { header: targetYear + '年度 配置予定数', key: 'nextCount', width: 25 },
    { header: '増減数', key: 'diff', width: 10 },
    { header: '増減理由', key: 'reasonText', width: 80 }
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

  statsList.forEach(stat => {
    const row = ws.addRow({
      deptName: stat.deptName,
      currCount: stat.currCount,
      nextCount: stat.nextCount,
      diff: stat.diff,
      reasonText: stat.reasonText
    });
    
    row.alignment = { wrapText: true, vertical: 'middle' };
    totalCurr += stat.currCount;
    totalNext += stat.nextCount;
    rowIdx++;
  });

  // Total row
  const totalRow = ws.addRow({
    deptName: '合　計',
    currCount: totalCurr,
    nextCount: totalNext,
    diff: totalNext - totalCurr,
    reasonText: ''
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
