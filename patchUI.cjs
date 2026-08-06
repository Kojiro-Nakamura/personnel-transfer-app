const fs = require('fs');
let content = fs.readFileSync('src/components/modals/Modals.jsx', 'utf8');

// Header row 1
content = content.replace(
  '<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>',
  '<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>\n                {historyYears.length > 0 && <th colSpan={historyYears.length} className="px-2 py-1 border-b border-l text-center bg-emerald-100/50 text-emerald-900">履歴</th>}'
);

// Header row 2
content = content.replace(
  '<Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />',
  '<Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />\n                {historyYears.length > 0 && historyYears.map(year => (\n                  <Th key={`hist-h-${year}`} label={getEraFormattedYear(year)} sortKey={`hist_${year}`} className="bg-emerald-50/50 border-l" />\n                ))}'
);

// Data rows
const targetDataRow = `<td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={inputCls} /></td>`;
content = content.replace(
  targetDataRow,
  targetDataRow + `\n                    {historyYears.length > 0 && historyYears.map(year => {\n                      const hist = (emp.history || []).find(h => h.year === year);\n                      return (\n                        <td key={\`hist-d-\${year}\`} className="bg-emerald-50/30 border-l p-1 min-w-[120px]">\n                          <input type="text" value={hist ? hist.department : ''} readOnly className={inputCls + " bg-transparent border-transparent text-slate-600 text-center"} title={hist ? hist.department : ''} />\n                        </td>\n                      );\n                    })}`
);

fs.writeFileSync('src/components/modals/Modals.jsx', content, 'utf8');
