import { addSimplePlanSheet } from './src/utils/exportExcel.js';
import ExcelJS from 'exceljs';

const employees = [{ id: '1', name: '“c’† ‘¾˜Y', currentDept: 'd1', currentGroup: 'g1', currentGrade: '‰Û’·‹‰', nextDept: 'd1', nextGroup: 'g1', nextGrade: '‰Û’·‹‰' }];
const departments = [{ id: 'd1', type: 'regular', name: 'D1', posts: [{id: 'p1', name: 'P1'}], groups: [{id: 'g1', name: 'G1', posts: []}] }];
const deptMap = {
  'd1': { direct: { current: [], next: [] }, groups: { 'g1': { direct: {current:[], next:[]}, posts:{} } }, posts: { 'p1': { current: ['1'], next: ['1'] } } },
  'unassigned': { current: [], next: [] }
};
const currMap = { 'p1': ['1'], unassigned: [], retired: [] };
const nextMap = { 'p1': ['1'], unassigned: [], retired: [] };
const notes = [];

async function run() {
  const workbook = new ExcelJS.Workbook();
  addSimplePlanSheet(workbook, 'Sheet2', 'test', 2027, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
  
  [5, 6, 7, 9, 10, 11, 12].forEach(c => {
    let maxLength = 0;
    workbook.worksheets[0].getColumn(c).eachCell({ includeEmpty: true }, cell => {
      if (cell.row <= 4) return;
      const v = cell.value ? cell.value.toString() : '';
      if (v) {
        let lw = 0;
        for (let ch of v) lw += ch.charCodeAt(0) > 255 ? 1.6 : 0.9;
        if (lw > maxLength) maxLength = lw;
      }
    });
    console.log('Col', c, 'maxLength:', maxLength);
  });
}
run();
