const ExcelJS = require('exceljs');

async function test() {
    try {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Test');
        const row = ws.getRow(1);
        row.values = ['Dept1'];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            if (colNumber === 1) {
                cell.note = 'This is a test memo';
            }
        });
        
        const buffer = await wb.xlsx.writeBuffer();
        console.log('Success, buffer length:', buffer.length);
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
