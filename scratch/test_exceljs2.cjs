const ExcelJS = require("exceljs");
async function run() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Test");
  
  const arr = ["Zero", "One", "Two"];
  const r1 = ws.getRow(1);
  r1.values = arr;
  
  console.log("Col 1:", ws.getRow(1).getCell(1).value);
  console.log("Col 2:", ws.getRow(1).getCell(2).value);
  console.log("Col 3:", ws.getRow(1).getCell(3).value);
}
run();