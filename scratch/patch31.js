import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t1 = `            <EmployeeFormSection title="今年度（現行）" isCurrent={true} disabled={!editCurrent} fd={fd} setFd={setFd} departments={departments} editCurrent={editCurrent} setEditCurrent={setEditCurrent} />
            <EmployeeFormSection title="来年度（新）" isCurrent={false} disabled={false} fd={fd} setFd={setFd} departments={departments} />`;
const r1 = `            <EmployeeFormSection title={\`今年度（現行）\${getEraFormattedYear(targetYear - 1)}\`} isCurrent={true} disabled={!editCurrent} fd={fd} setFd={setFd} departments={departments} editCurrent={editCurrent} setEditCurrent={setEditCurrent} />
            <EmployeeFormSection title={\`来年度（新）\${getEraFormattedYear(targetYear)}\`} isCurrent={false} disabled={false} fd={fd} setFd={setFd} departments={departments} />`;

const t2 = `                const colorMap = {};
                const textColors = ["text-[#FF8000]", "text-[#00BFFF]", "text-[#4B0082]"];
                let colorIdx = 0;
                displayHistory.forEach(h => {
                  const dept = h.department || '-';
                  if (dept !== '-' && !colorMap[dept]) {
                    colorMap[dept] = textColors[colorIdx % textColors.length];
                    colorIdx++;
                  }
                });

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {
                  const histAge = (fd.birthDate && !isNaN(h.year)) ? calculateAge(fd.birthDate, h.year) : null;
                  const isLastInRow = (i + 1) % 5 === 0;
                  const isLast = i === arr.length - 1;
                  const isRowStart = i % 5 === 0 && i !== 0;
                  const cellBg = (h.isNext && isPromoted) ? promoBg : "bg-white";
                  return (
                    <div key={i} className={cx("relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0", cellBg)} title={h.department || '-'}>
                      {isRowStart && (
                        <ChevronRight className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-[10px] text-slate-500 font-bold border-b w-full pb-0.5 mb-0.5 whitespace-nowrap text-center">
                        {h.year} ({getEraSuffix(h.year)})
                        {histAge !== null && !isNaN(histAge) && <span className="ml-0.5 text-[9px]">{histAge}歳</span>}
                        {h.isNext && <span className="ml-1 text-[9px] text-[#065084]">(予定)</span>}
                      </span>
                      <span className={cx("text-[11px] font-bold text-left truncate w-full", colorMap[h.department || '-'] || "text-slate-700")}>
                        {h.department || '-'}
                      </span>`;

const r2 = `                let prevDept = null;

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
                    <div key={i} className={cx("relative flex flex-col border px-2 py-1 rounded shadow-sm w-full min-w-0", cellBg)} title={h.department || '-'}>
                      {isRowStart && (
                        <ChevronRight className="absolute -left-[16px] top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-[10px] text-slate-500 font-bold border-b w-full pb-0.5 mb-0.5 whitespace-nowrap text-center">
                        {h.year} ({getEraSuffix(h.year)})
                        {histAge !== null && !isNaN(histAge) && <span className="ml-0.5 text-[9px]">{histAge}歳</span>}
                        {h.isNext && <span className="ml-1 text-[9px] text-[#065084]">(予定)</span>}
                      </span>
                      <span className={cx("text-[11px] text-left truncate w-full", isChange ? "font-bold text-slate-900" : "font-normal text-slate-700")}>
                        {h.department || '-'}
                      </span>`;

const replaceWithCRLF = (str, target, replacement) => {
  const t_crlf = target.replace(/\n/g, '\r\n');
  const r_crlf = replacement.replace(/\n/g, '\r\n');
  if (str.includes(target)) return str.replace(target, replacement);
  if (str.includes(t_crlf)) return str.replace(t_crlf, r_crlf);
  return null;
}

let newContent = content;
let replaced = replaceWithCRLF(newContent, t1, r1);
if (!replaced) { console.log("Failed t1"); process.exit(1); }
newContent = replaced;

replaced = replaceWithCRLF(newContent, t2, r2);
if (!replaced) { console.log("Failed t2"); process.exit(1); }
newContent = replaced;

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', newContent);
console.log("Patched EmployeeComponents.jsx for history text formatting and section titles");
