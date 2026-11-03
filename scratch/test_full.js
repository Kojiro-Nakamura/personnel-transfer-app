import ExcelJS from 'exceljs';
import { exportPlanToExcel } from '../src/utils/exportExcel.js';

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

exportPlanToExcel('test.xlsx', targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, true)
  .then(() => console.log("SUCCESS!"))
  .catch(e => console.error(e));