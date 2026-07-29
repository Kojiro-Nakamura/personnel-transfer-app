const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Import getEraFormattedYear and calculateAge
if (!content.includes('getEraFormattedYear')) {
  content = content.replace(
    /import \{ calculateAge, parseJapaneseDate, parseCSVRow \} from '\.\.\/utils\/helpers\.js';/,
    `import { calculateAge, parseJapaneseDate, parseCSVRow, getEraFormattedYear } from '../utils/helpers.js';`
  );
}

// Add historyYears outside component
if (!content.includes('const historyYears')) {
  content = content.replace(
    /export const BulkEditModal = \(\{ isOpen, onClose, onSave, employees, departments \}\) => \{/,
    `const historyYears = Array.from({ length: 2069 - 1985 + 1 }, (_, i) => 1985 + i);\n\nexport const BulkEditModal = ({ isOpen, onClose, onSave, employees, departments }) => {`
  );
}

// 2. Fix handleDownloadTemplate and handleExportCSV headers
const baseHeadersStr = `      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級"`;
const newHeadersStr = `      "【昇進年度】係長級(主査)", "【昇進年度】補佐級I(主任)", "【昇進年度】補佐級II(班長)", "【昇進年度】補佐級III", "【昇進年度】課長級", "【昇進年度】所属長級", "【昇進年度】次長級", "【昇進年度】部長級",
      ...historyYears.map(y => getEraFormattedYear(y))`;

if (!content.includes('...historyYears.map')) {
  content = content.replace(new RegExp(baseHeadersStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newHeadersStr);
}

const sampleRowOld = `2015,2018,2022,,,,,"`;
const sampleRowNew = `2015,2018,2022,,,,,", ...historyYears.map(y => y===2000?'森林':'')`;
if (content.includes(sampleRowOld)) {
  content = content.replace(/const sampleRow = "([^"]+)";/, "const sampleRow = `$1` + historyYears.map(y => ',').join('');");
}

// 3. handleExportCSV rows array
const exportRowOld = `emp.promoYearDeptHead || ''\n      ];`;
const exportRowNew = `emp.promoYearDeptHead || '',
        ...historyYears.map(year => {
          const hist = (emp.history || []).find(h => h.year === year);
          return hist ? hist.department : '';
        })
      ];`;
if (!content.includes('emp.history || []')) {
  content = content.replace(exportRowOld, exportRowNew);
}

// 4. handleImportCSV logic
const importLogicOld = `          promoYearDeptHead: pDept,\n        };`;
const importLogicNew = `          promoYearDeptHead: pDept,
        };

        if (cols.length > 32) {
          let newHistory = [];
          for (let k = 0; k < historyYears.length; k++) {
            if (32 + k < cols.length) {
              const year = historyYears[k];
              const deptName = cols[32 + k] || '';
              if (deptName) {
                const age = calculateAge(parseJapaneseDate(bStr), year);
                newHistory.push({
                  year,
                  japaneseYear: getEraFormattedYear(year),
                  age,
                  department: deptName
                });
              }
            }
          }
          newEmpData.history = newHistory;
        } else if (targetEmp && targetEmp.history) {
          newEmpData.history = targetEmp.history;
        } else {
          newEmpData.history = [];
        }`;

if (!content.includes('newEmpData.history = newHistory;')) {
  content = content.replace(importLogicOld, importLogicNew);
}

// 5. Table rendering (UI)
const tableHeader1Old = `<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (年)</th>\n              </tr>`;
const tableHeader1New = `<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900 border-r">昇進年度 (年)</th>
                <th colSpan={historyYears.length} className="px-2 py-1 border-b text-center bg-emerald-100/50 text-emerald-900">配属先履歴</th>
              </tr>`;
if (!content.includes('配属先履歴')) {
  content = content.replace(tableHeader1Old, tableHeader1New);
}

const tableHeader2Old = `                  <th key={\`promo-\${k}\`} className="px-1.5 py-1 border-b border-slate-300 bg-fuchsia-50/50 text-fuchsia-800 border-r last:border-r-0 min-w-[3.5rem] font-medium leading-tight whitespace-normal break-words max-w-[4rem] align-bottom pb-2">
                    {k}
                  </th>
                ))}
              </tr>`;
const tableHeader2New = `                  <th key={\`promo-\${k}\`} className="px-1.5 py-1 border-b border-slate-300 bg-fuchsia-50/50 text-fuchsia-800 border-r min-w-[3.5rem] font-medium leading-tight whitespace-normal break-words max-w-[4rem] align-bottom pb-2">
                    {k}
                  </th>
                ))}
                {historyYears.map(year => (
                  <th key={\`hist-h-\${year}\`} className="px-1.5 py-1 border-b border-slate-300 bg-emerald-50/50 text-emerald-800 border-r last:border-r-0 min-w-[4rem] font-medium leading-tight">
                    {getEraFormattedYear(year)}
                  </th>
                ))}
              </tr>`;
if (!content.includes('getEraFormattedYear(year)')) {
  content = content.replace(tableHeader2Old, tableHeader2New);
}

const tableRowOld = `                      value={emp[promoMap[k]] || ''}
                      onChange={(e) => handleEmpChange(emp.id, promoMap[k], e.target.value)}
                    />
                  </td>
                ))}
              </tr>`;
const tableRowNew = `                      value={emp[promoMap[k]] || ''}
                      onChange={(e) => handleEmpChange(emp.id, promoMap[k], e.target.value)}
                    />
                  </td>
                ))}
                {historyYears.map(year => {
                  const hist = (emp.history || []).find(h => h.year === year);
                  const deptVal = hist ? hist.department : '';
                  return (
                    <td key={\`hist-d-\${year}\`} className="px-1 py-1 border-b border-r border-slate-200 bg-white">
                      <input 
                        type="text" 
                        className={inputCls}
                        value={deptVal}
                        onChange={(e) => {
                          const val = e.target.value;
                          let newHistory = [...(emp.history || [])];
                          const idx = newHistory.findIndex(h => h.year === year);
                          if (idx >= 0) {
                            if (val) {
                              newHistory[idx].department = val;
                            } else {
                              newHistory.splice(idx, 1);
                            }
                          } else if (val) {
                            const age = calculateAge(emp.birthDate, year);
                            newHistory.push({
                              year,
                              japaneseYear: getEraFormattedYear(year),
                              age,
                              department: val
                            });
                            newHistory.sort((a, b) => a.year - b.year);
                          }
                          handleEmpChange(emp.id, 'history', newHistory);
                        }}
                      />
                    </td>
                  );
                })}
              </tr>`;
if (!content.includes('hist-d-${year}')) {
  content = content.replace(tableRowOld, tableRowNew);
}

fs.writeFileSync(file, content, 'utf8');
