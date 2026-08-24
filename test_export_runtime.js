import { exportPlanToExcel } from './src/utils/exportExcel.js';
import * as exportExcel from './src/utils/exportExcel.js';
import ExcelJS from 'exceljs';
import fs from 'fs';

exportExcel.saveWorkbook = async (workbook, fileName) => {
  await workbook.xlsx.writeFile(fileName);
};

global.URL = { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} };
global.document = { createElement: () => ({ click: () => {}, style: {} }), body: { appendChild: () => {}, removeChild: () => {} } };

const employees = [{ id: '1', name: 'A', currentDept: 'd1', currentGroup: 'g1', currentGrade: '課長級', nextDept: 'd1', nextGroup: 'g1', nextGrade: '課長級' }];
const departments = [{ id: 'd1', type: 'regular', name: 'D1', posts: [{id: 'p1', name: 'P1'}], groups: [{id: 'g1', name: 'G1', posts: []}] }];
const deptMap = {
  'd1': { direct: { current: [], next: [] }, groups: { 'g1': { direct: {current:[], next:[]}, posts:{} } }, posts: { 'p1': { current: ['1'], next: ['1'] } } },
  'unassigned': { current: [], next: [] }
};

const currMap = { 'p1': ['1'], unassigned: [], retired: [] };
const nextMap = { 'p1': ['1'], unassigned: [], retired: [] };

const notes = [];

async function run() {
  try {
    const workbook = new ExcelJS.Workbook();
    // Re-implement exportPlanToExcel to write to disk
    exportExcel.addPlanSheet(workbook, '人事異動案', 'test.xlsx', 2027, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
    exportExcel.addSimplePlanSheet(workbook, '人事異動案（シンプル）', 'test.xlsx', 2027, departments, deptMap, currMap, nextMap, employees, notes, 0, true);
    await workbook.xlsx.writeFile('test.xlsx');
    console.log("Saved test.xlsx");
  } catch (e) {
    console.error("Export Error:", e);
  }
}
run();
