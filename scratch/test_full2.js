import ExcelJS from 'exceljs';
import { exportPlanToExcel } from '../src/utils/exportExcel.js';

const targetYear = 2024;
const departments = [{ id: 'd1', name: 'Dept1', groups: [{ id: 'g1', name: 'Group1', posts: [] }], posts: [{ id: 'p1', name: 'Post1' }] }];
const deptMap = { 'd1': departments[0] };
const currMap = { 
  'd1': { direct: { current: [] } },
  'd1_g1': { direct: { current: [{
    id: 'e1',
    name: 'Test Employee',
    currentGrade: '1',
    nextGrade: '1',
    departmentId: 'd1',
    groupId: 'g1',
    history: [{ year: 2023, department: 'Dept1' }]
  }] } },
  'unassigned': { direct: { current: [] } },
  'retired': { direct: { current: [] } }
};
const nextMap = currMap;
const employees = [{
    id: 'e1',
    name: 'Test Employee',
    currentGrade: '1',
    nextGrade: '1',
    departmentId: 'd1',
    groupId: 'g1',
    history: [{ year: 2023, department: 'Dept1' }]
}];
const notes = {};

exportPlanToExcel('test.xlsx', targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, true)
  .then(() => console.log("SUCCESS!"))
  .catch(e => console.error(e));