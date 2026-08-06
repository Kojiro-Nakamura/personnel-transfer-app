import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `                let prevDept = null;

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {
                  const dept = h.department || '-';
                  let isChange = false;
                  if (dept !== '-' && (h.isNext || prevDept === null || dept !== prevDept)) {
                    isChange = true;
                  }
                  if (dept !== '-') prevDept = dept;

                  const histAge = (fd.birthDate && !isNaN(h.year)) ? calculateAge(fd.birthDate, h.year) : null;
                  const isLastInRow = (i + 1) % 5 === 0;
                  const isLast = i === arr.length - 1;
                  const isRowStart = i % 5 === 0 && i !== 0;
                  const cellBg = (h.isNext && isPromoted) ? promoBg : "bg-white";
                  return (
                    <div key={i} className={cx("relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0", cellBg)} title={h.department || '-'}>`;

const r = `                let prevDept = null;
                const promoYearMap = {};
                if (fd.promoYearChief) promoYearMap[fd.promoYearChief] = "係長級(主査)";
                if (fd.promoYearAssistant1) promoYearMap[fd.promoYearAssistant1] = "補佐級I(主任)";
                if (fd.promoYearAssistant2) promoYearMap[fd.promoYearAssistant2] = "補佐級II(班長)";
                if (fd.promoYearAssistant3) promoYearMap[fd.promoYearAssistant3] = "補佐級III(補佐兼班長)";
                if (fd.promoYearSecHead) promoYearMap[fd.promoYearSecHead] = "課長級";
                if (fd.promoYearDivHead) promoYearMap[fd.promoYearDivHead] = "所属長級";
                if (fd.promoYearDeputyHead) promoYearMap[fd.promoYearDeputyHead] = "次長級";
                if (fd.promoYearDeptHead) promoYearMap[fd.promoYearDeptHead] = "部長級";

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {
                  const dept = h.department || '-';
                  let isChange = false;
                  if (dept !== '-' && (h.isNext || prevDept === null || dept !== prevDept)) {
                    isChange = true;
                  }
                  if (dept !== '-') prevDept = dept;

                  const histAge = (fd.birthDate && !isNaN(h.year)) ? calculateAge(fd.birthDate, h.year) : null;
                  const isLastInRow = (i + 1) % 5 === 0;
                  const isLast = i === arr.length - 1;
                  const isRowStart = i % 5 === 0 && i !== 0;
                  const cellBg = (h.isNext && isPromoted) ? promoBg : "bg-white";
                  
                  const promoGradeForYear = promoYearMap[h.year];
                  const histBorderClass = promoGradeForYear ? \`border-2 \${getPromotedBorderClass(promoGradeForYear)}\` : "border border-slate-300";
                  
                  return (
                    <div key={i} className={cx("relative flex flex-col px-2 py-1 rounded shadow-sm w-full min-w-0", histBorderClass, cellBg)} title={h.department || '-'}>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let replacedStr = replaceWithCRLF(content, t, r);
if (!replacedStr) {
  console.log("Failed to patch history border");
  process.exit(1);
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', replacedStr);
console.log("Patched EmployeeComponents.jsx for history cell borders");
