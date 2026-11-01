import ExcelJS from 'exceljs';
import { addReasonSheet } from './exportReasonSheet.js';
import { saveWorkbook } from './excel/excelHelpers.js';
import { addPlanSheet } from './excel/planSheet.js';
import { addSimplePlanSheet } from './excel/simplePlanSheet.js';
import { addCurrentBasePlanSheet } from './excel/currentBasePlanSheet.js';
import { addListSheet } from './excel/listSheet.js';
import { addBirthYearSheet } from './excel/birthYearSheet.js';

export {
  saveWorkbook,
  addPlanSheet,
  addSimplePlanSheet,
  addCurrentBasePlanSheet,
  addListSheet,
  addBirthYearSheet
};

export const exportPlanToExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  addSimplePlanSheet(workbook, '人事異動案（シンプル）', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addPlanSheet(workbook, '人事異動案', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addCurrentBasePlanSheet(workbook, `R${targetYear - 2019}→R${targetYear - 2018}`, fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, filterLevel, showCount);
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
  addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
  addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};

export const exportListToExcel = async (fileName, targetYear, employees, departments) => {
  const workbook = new ExcelJS.Workbook();
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
  addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
  addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};

export const exportUnifiedExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, showCount = true) => {
  const workbook = new ExcelJS.Workbook();

  // 1. 指定職人事異動 (filterLevel = 9)
  addPlanSheet(workbook, '指定職人事異動', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 9, showCount);

  // 2. 異動案リスト (filterLevel = 0)
  addPlanSheet(workbook, '異動案リスト', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, showCount);

  // 3. 増減理由
  addReasonSheet(workbook, '増減理由', targetYear, departments, deptMap, currMap, nextMap, employees, notes);

  // 4. つなぎ表 (職員一覧)
  addListSheet(workbook, 'つなぎ表', fileName, targetYear, employees, departments);
  addBirthYearSheet(workbook, '生年別一覧（今年度）', targetYear, employees, departments, false);
  addBirthYearSheet(workbook, '生年別一覧（来年度）', targetYear, employees, departments, true);

  await saveWorkbook(workbook, fileName);
};
