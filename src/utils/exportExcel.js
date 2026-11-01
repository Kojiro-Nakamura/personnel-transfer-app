import ExcelJS from 'exceljs';
import { GRADE_LEVELS } from '../constants/config.js';
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
  const baseTitle = String(fileName || '').replace(/\.xlsx$/i, '').replace(/[(\uff08][^)\uff09]*以上[)\uff09]$/, '');

  const levelAll = 0;
  const levelSecHead = GRADE_LEVELS['課長級']; // 7
  const levelAssistant2 = GRADE_LEVELS['補佐級II(班長)']; // 5
  const currEra = `R${targetYear - 2019}`;
  const nextEra = `R${targetYear - 2018}`;

  // 1. 人事異動案（シンプル）：全件、課長級以上、補佐級II(班長)以上
  const wsSimpleAll = addSimplePlanSheet(workbook, '簡(全)', baseTitle, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelAll, showCount);
  const wsSimpleSec = addSimplePlanSheet(workbook, '簡(課長)', `${baseTitle}（課長級以上）`, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelSecHead, showCount);
  addSimplePlanSheet(workbook, '簡(班長)', `${baseTitle}（補佐級II(班長)以上）`, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelAssistant2, showCount);

  // 簡(全)シートのD職名(4)〜L備考(12)の列幅を簡(課長)と同じにする
  for (let c = 4; c <= 12; c++) {
    wsSimpleAll.getColumn(c).width = wsSimpleSec.getColumn(c).width;
  }

  // 2. 人事異動案：全件、課長級以上、補佐級II(班長)以上
  addPlanSheet(workbook, '案(全)', baseTitle, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelAll, showCount);
  addPlanSheet(workbook, '案(課長)', `${baseTitle}（課長級以上）`, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelSecHead, showCount);
  addPlanSheet(workbook, '案(班長)', `${baseTitle}（補佐級II(班長)以上）`, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelAssistant2, showCount);

  // 3. 今年度ベース・職員一覧・生年別一覧（今年度・来年度）
  addCurrentBasePlanSheet(workbook, `${currEra}→${nextEra}`, baseTitle, targetYear, departments, deptMap, currMap, nextMap, employees, notes, levelAll, showCount);
  addListSheet(workbook, '職員一覧', baseTitle, targetYear, employees, departments);
  addBirthYearSheet(workbook, `生年(${currEra})`, targetYear, employees, departments, false);
  addBirthYearSheet(workbook, `生年(${nextEra})`, targetYear, employees, departments, true);

  await saveWorkbook(workbook, fileName);
};

export const exportListToExcel = async (fileName, targetYear, employees, departments) => {
  const workbook = new ExcelJS.Workbook();
  const currEra = `R${targetYear - 2019}`;
  const nextEra = `R${targetYear - 2018}`;
  addListSheet(workbook, '職員一覧', fileName, targetYear, employees, departments);
  addBirthYearSheet(workbook, `生年(${currEra})`, targetYear, employees, departments, false);
  addBirthYearSheet(workbook, `生年(${nextEra})`, targetYear, employees, departments, true);
  await saveWorkbook(workbook, fileName);
};

export const exportUnifiedExcel = async (fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, showCount = true) => {
  const workbook = new ExcelJS.Workbook();
  const currEra = `R${targetYear - 2019}`;
  const nextEra = `R${targetYear - 2018}`;

  // 1. 指定職人事異動 (filterLevel = 9)
  addPlanSheet(workbook, '指定職人事異動', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 9, showCount);

  // 2. 異動案リスト (filterLevel = 0)
  addPlanSheet(workbook, '異動案リスト', fileName, targetYear, departments, deptMap, currMap, nextMap, employees, notes, 0, showCount);

  // 3. 増減理由
  addReasonSheet(workbook, '増減理由', targetYear, departments, deptMap, currMap, nextMap, employees, notes);

  // 4. つなぎ表 (職員一覧)
  addListSheet(workbook, 'つなぎ表', fileName, targetYear, employees, departments);
  addBirthYearSheet(workbook, `生年(${currEra})`, targetYear, employees, departments, false);
  addBirthYearSheet(workbook, `生年(${nextEra})`, targetYear, employees, departments, true);

  await saveWorkbook(workbook, fileName);
};
