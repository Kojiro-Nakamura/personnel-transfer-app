const excel = require('./out.cjs');
const ExcelJS = require('exceljs');

const employees = [{ id: '1', name: 'A', currentDept: 'd1', currentGroup: 'g1', currentGrade: '‰Û’·‹‰', nextDept: 'd1', nextGroup: 'g1', nextGrade: '‰Û’·‹‰' }];
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
  excel.addPlanSheet(workbook, 'Sheet1', 'test', 2027, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
  excel.addSimplePlanSheet(workbook, 'Sheet2', 'test', 2027, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
  await workbook.xlsx.writeFile('test.xlsx');
  console.log("Written to test.xlsx");
}
run();
