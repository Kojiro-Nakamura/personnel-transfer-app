import ExcelJS from 'exceljs';
import { addCurrentBasePlanSheet } from '../src/utils/exportExcel.js';

const workbook = new ExcelJS.Workbook();
const targetYear = 2024;
const departments = [{ id: 'd1', name: 'Dept1', groups: [], posts: [] }];
const deptMap = {};
const currMap = { 'd1_all': [{ id: 'e1', name: 'Test Employee' }] };
const nextMap = { 'd1_all': [{ id: 'e1', name: 'Test Employee' }] };
const employees = [{
  id: 'e1',
  name: 'Test Employee',
  currentGrade: '1',
  nextGrade: '1',
  departmentId: 'unassigned',
  history: [{ year: 2023, department: 'Dept1' }]
}];
const notes = {};

try {
  addCurrentBasePlanSheet(workbook, 'Sheet1', 'File.xlsx', targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
  console.log("SUCCESS!");
} catch(e) {
  console.error(e);
}