const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

const targetRow1 = '<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>';
const repRow1 = '<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>\n                {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}';

const targetRow2 = '<Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />';
const repRow2 = '<Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />\n                {historyYears.length > 0 && historyYears.map(year => (\n                  <Th key={`hist-h-${year}`} label={getEraFormattedYear(year)} sortKey={`hist_${year}`} className="bg-emerald-50/50 border-l" />\n                ))}';

content = content.split(targetRow1).join(repRow1);
content = content.split(targetRow2).join(repRow2);

// And we also need to render the data rows in the preview modal!
const targetDataRow = `<td className="bg-fuchsia-50/30 text-center"><input type="number" value={emp.promoYearDeptHead||''} readOnly className={inputCls + " cursor-default text-slate-500"} /></td>`;
const repDataRow = targetDataRow + `\n                      {historyYears.length > 0 && historyYears.map(year => {\n                        const hist = (emp.history || []).find(h => h.year === year);\n                        return (\n                          <td key={\`hist-d-\${year}\`} className="bg-emerald-50/30 border-l p-1 min-w-[120px]">\n                            <input type="text" value={hist ? hist.department : ''} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center"} title={hist ? hist.department : ''} />\n                          </td>\n                        );\n                      })}`;

content = content.split(targetDataRow).join(repDataRow);

fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
console.log('Headers replaced in all tables!');
