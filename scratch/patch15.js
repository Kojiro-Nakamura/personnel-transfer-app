import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t1 = `                if (nextDeptStr && nextDeptStr !== ' / 課直属' && nextDeptStr !== '未配置') {
                  if (!displayHistory.find(h => h.year === targetYear)) {
                    displayHistory.push({ year: targetYear, department: nextDeptStr, isNext: true });
                  }
                }

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {`;

const r1 = `                if (nextDeptStr && nextDeptStr !== ' / 課直属' && nextDeptStr !== '未配置') {
                  if (!displayHistory.find(h => h.year === targetYear)) {
                    displayHistory.push({ year: targetYear, department: nextDeptStr, isNext: true });
                  }
                }

                const colorMap = {};
                const textColors = ["text-red-600", "text-blue-700", "text-emerald-700"];
                let colorIdx = 0;
                displayHistory.forEach(h => {
                  const dept = h.department || '-';
                  if (dept !== '-' && !colorMap[dept]) {
                    colorMap[dept] = textColors[colorIdx % textColors.length];
                    colorIdx++;
                  }
                });

                return displayHistory.length > 0 ? displayHistory.map((h, i, arr) => {`;

const t1_crlf = t1.replace(/\n/g, '\r\n');
const r1_crlf = r1.replace(/\n/g, '\r\n');

if (content.includes(t1)) content = content.replace(t1, r1);
else if (content.includes(t1_crlf)) content = content.replace(t1_crlf, r1_crlf);

const t2 = `                      <span className="text-[11px] font-bold text-slate-700 text-left truncate w-full">
                        {h.department || '-'}
                      </span>`;

const r2 = `                      <span className={cx("text-[11px] font-bold text-left truncate w-full", colorMap[h.department || '-'] || "text-slate-700")}>
                        {h.department || '-'}
                      </span>`;

const t2_crlf = t2.replace(/\n/g, '\r\n');
const r2_crlf = r2.replace(/\n/g, '\r\n');

if (content.includes(t2)) content = content.replace(t2, r2);
else if (content.includes(t2_crlf)) content = content.replace(t2_crlf, r2_crlf);

// Fix the left chevron padding to prevent it from getting cut off
const t3 = `<div className="grid grid-cols-5 gap-y-2 gap-x-4 pl-3 pr-1">`;
const r3 = `<div className="grid grid-cols-5 gap-y-2 gap-x-4 pl-4 pr-1">`;

if (content.includes(t3)) content = content.replace(t3, r3);

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Patched history coloring');
