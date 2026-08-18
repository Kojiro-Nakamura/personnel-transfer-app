import ExcelJS from 'exceljs';
import { exportPlanToExcel } from './src/utils/exportExcel.js';
import { INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES } from './src/constants/initialData.js';

async function run() {
  const workbook = new ExcelJS.Workbook();
  const notes = [];
  
  await exportPlanToExcel(workbook, '指定職人事異動', 'test.xlsx', 2026, INITIAL_DEPARTMENTS, {}, {}, {}, INITIAL_EMPLOYEES, notes, 9, true);
  await exportPlanToExcel(workbook, '異動案リスト', 'test.xlsx', 2026, INITIAL_DEPARTMENTS, {}, {}, {}, INITIAL_EMPLOYEES, notes, 0, true);
  
  console.log("Success! Sheets: " + workbook.worksheets.map(s => s.name).join(', '));
}

run().catch(console.error);
