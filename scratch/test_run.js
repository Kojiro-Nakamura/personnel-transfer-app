import { exportUnifiedExcel } from '../src/utils/exportExcel.js';
import ExcelJS from 'exceljs';

const dummyEmp = {
  id: 'e1',
  name: 'Test',
  currentGrade: 'A',
  nextGrade: 'B',
  departmentId: 'd1',
  groupId: 'g1',
  postId: 'p1',
  promoYearChief: '2020-01-01',
  history: [{ year: 2025, department: 'Dep' }]
};

const deptMap = {
  'd1': {
    direct: { current: [dummyEmp] },
    groups: {
      'g1': {
        direct: { current: [] },
        posts: {
          'p1': { current: [dummyEmp] }
        }
      }
    },
    posts: {}
  }
};

const departments = [
  { id: 'd1', name: 'Dept 1', posts: [], groups: [{ id: 'g1', name: 'Group 1', posts: [{ id: 'p1', name: 'Post 1' }] }] }
];

try {
  await exportUnifiedExcel('dummy.xlsx', 2026, departments, deptMap, {}, {}, [dummyEmp], {}, true);
  console.log('Ran successfully without crashing instantly (maybe).');
} catch (e) {
  console.error(e);
}