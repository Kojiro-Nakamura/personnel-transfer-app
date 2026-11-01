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

export const saveWorkbook = async (workbook, fileName) => {
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
