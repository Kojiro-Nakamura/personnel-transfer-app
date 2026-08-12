import ExcelJS from 'exceljs';
const wb = new ExcelJS.Workbook();
const ws = wb.addWorksheet('Sheet1', {
  views: [{
    state: 'frozen',
    xSplit: 3,
    ySplit: 5,
    showGridLines: false,
    style: 'pageBreakPreview',
    zoomScale: 100
  }]
});
wb.xlsx.writeFile('test.xlsx').then(() => console.log('Done'));
