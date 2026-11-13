// Excel出力共通スタイル・ヘルパー関数
export const defaultFont = { name: 'BIZ UDPゴシック', size: 8 };
export const headerFont = { name: 'BIZ UDPゴシック', size: 8, bold: true };
export const borderStyle = { style: 'thin', color: { argb: 'FF000000' } };
export const thickBorderStyle = { style: 'medium', color: { argb: 'FF000000' } };

export const grayBorderStyle = { style: 'thin', color: { argb: 'FF94A3B8' } };
export const grayThickBorderStyle = { style: 'medium', color: { argb: 'FF475569' } };

export const getCellBorders = (top = false, bottom = false, left = false, right = false, isGray = false) => {
  const b = {};
  const thinStyle = isGray ? grayBorderStyle : borderStyle;
  const thickStyle = isGray ? grayThickBorderStyle : thickBorderStyle;

  if (top) b.top = top === 'thick' ? thickStyle : thinStyle;
  if (bottom) b.bottom = bottom === 'thick' ? thickStyle : thinStyle;
  if (left) b.left = left === 'thick' ? thickStyle : thinStyle;
  if (right) b.right = right === 'thick' ? thickStyle : thinStyle;
  return b;
};

// 空文字列('')や空白のみの文字列が入ったセルは、見た目は空欄でも
// Excelのステータスバーの「データの個数」で1個とカウントされてしまうため、
// 保存前に本当の空セル(null)に置き換える（書式・罫線・塗りつぶしは保持される）
export const clearEmptyStringCells = (workbook) => {
  workbook.eachSheet(ws => {
    const isSimpleSheet = ws.name.startsWith('簡(');
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        // 簡(全)・簡(課長)・簡(班長)の特殊事情列（3列目：C列）のデータ行は
        // 左隣の配属希望の文字がはみ出して表示されるのを防ぐため空文字列('')を維持する
        if (isSimpleSheet && rowNumber >= 7 && colNumber === 3) {
          return;
        }
        const v = cell.value;
        if (typeof v === 'string' && v.trim() === '') {
          cell.value = null;
        }
      });
    });
  });
};

export const saveWorkbook = async (workbook, fileName) => {
  clearEmptyStringCells(workbook);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xlsx') ? fileName : fileName + '.xlsx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getBirthFiscalYear = (dateStr) => {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return null;
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 4 || (month === 4 && day === 1)) {
    year -= 1;
  }
  return year;
};

export const getHireFiscalYearShort = (dateStr) => {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})[-\/\.](\d{1,2})[-\/\.](\d{1,2})/);
  if (!match) return '';
  let year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  if (month < 4) year -= 1;
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};

export const getEraYearOnly = (year) => {
  if (year >= 2019) return 'R' + (year - 2018);
  if (year >= 1989) return 'H' + (year - 1988);
  if (year >= 1926) return 'S' + (year - 1925);
  if (year >= 1912) return 'T' + (year - 1911);
  return year.toString();
};
