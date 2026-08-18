import ExcelJS from 'exceljs';

async function run() {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('増減理由');

  ws.columns = [
    { header: '所属名', key: 'deptName', width: 25 },
    { header: 'currCount', key: 'currCount', width: 25 }
  ];

  ws.insertRow(1, ['〇所属毎の増減理由']);
  ws.mergeCells('A1:C1');

  await workbook.xlsx.writeFile('test.xlsx');
  console.log("Success!");
}

run().catch(console.error);
