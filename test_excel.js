import ExcelJS from 'exceljs';
import fs from 'fs';

async function test() {
    try {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Test');
        ws.getCell('A1').value = 'Test';
        ws.getCell('A1').note = { texts: [{ font: { size: 10, name: 'BIZ UDPGothic' }, text: 'Hello' }] };
        await wb.xlsx.writeFile('test.xlsx');
        console.log('Success object note');
    } catch (e) {
        console.error('Error object note', e);
    }
}
test();
