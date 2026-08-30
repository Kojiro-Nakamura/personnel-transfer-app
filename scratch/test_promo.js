import pkg from 'exceljs';
const { Workbook } = pkg;
import { addPlanSheet, addSimplePlanSheet } from '../src/utils/exportExcel.js';

async function run() {
  const wb = new Workbook();
  
  const employees = [
    {
      id: 'emp1',
      name: 'テスト 太郎',
      furigana: 'テスト タロウ',
      currentGrade: '補佐級I(主任)',
      nextGrade: '補佐級II(班長)',
      currentDeptId: 'd1',
      departmentId: 'd1',
      currentGroupId: 'g1',
      groupId: 'g1',
      currentPostId: 'p1',
      postId: 'p1',
      birthDate: '1990-01-01',
      hireDate: '2012-04-01',
      promoYearAssistant1: '2020-04-01',
      history: [
         { year: 2024, department: '総務部', title: '主任' },
         { year: 2025, department: '総務部', title: '主任' }
      ]
    }
  ];
  
  const departments = [{ id: 'd1', name: '総務部', order: 1 }];
  const groups = [{ id: 'g1', departmentId: 'd1', name: '総務班', order: 1 }];
  const posts = [{ id: 'p1', groupId: 'g1', name: '班員', order: 1 }];
  
  const deptMap = { 'd1': departments[0] };
  const currMap = { 'd1': [employees[0]] };
  const nextMap = { 'd1': [employees[0]] };
  
  addPlanSheet(wb, '人事異動案', 'test.xlsx', 2026, departments, deptMap, currMap, nextMap, [2024, 2025]);
  
  const groupsSimple = [{ id: 'g1', departmentId: 'd1', name: '総務班', order: 1 }];
  const postsSimple = [{ id: 'p1', groupId: 'g1', name: '班員', order: 1 }];
  addSimplePlanSheet(wb, '人事異動案（シンプル）', 'test.xlsx', 2026, departments, groupsSimple, postsSimple, employees, [2024, 2025]);
  
  await wb.xlsx.writeFile('scratch/test_promo_output.xlsx');
  console.log('Generated scratch/test_promo_output.xlsx');
}
run();