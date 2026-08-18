import ExcelJS from 'exceljs';
import { addReasonSheet } from './src/utils/exportReasonSheet.js';

async function run() {
  const workbook = new ExcelJS.Workbook();
  const departments = [{ id: 'd1', name: 'Dept1' }];
  const employees = [{ id: 'e1', currentDeptId: 'd1', departmentId: 'd1', note: 'test' }];
  const notes = [];
  
  addReasonSheet(workbook, '増減理由', 2026, departments, {}, {}, {}, employees, notes);
  
  await workbook.xlsx.writeFile('testReason.xlsx');
  console.log("Success! Sheets: " + workbook.worksheets.map(s => s.name).join(', '));
}

run().catch(console.error);
