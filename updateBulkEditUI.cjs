const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const thead1Target = '<th colSpan="7" className="px-2 py-1 border-b text-center bg-blue-100/50 text-[#065084]">';
const thead1Replacement = '<th colSpan="7" className="px-2 py-1 border-b border-r text-center bg-blue-100/50 text-[#065084]">';
const thead1New = '<th colSpan="8" className="px-2 py-1 border-b text-center bg-fuchsia-100/50 text-fuchsia-900">昇進年度 (西暦)</th>';

const thead2New = `
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-l border-r" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r" />
                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50" />
`;

const tbodyNew = `
                    <td className="bg-fuchsia-50/30 border-l"><input type="number" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeputyHead||''} onChange={e => handleChange(emp.id,'promoYearDeputyHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDivHead||''} onChange={e => handleChange(emp.id,'promoYearDivHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearSecHead||''} onChange={e => handleChange(emp.id,'promoYearSecHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant3||''} onChange={e => handleChange(emp.id,'promoYearAssistant3',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant2||''} onChange={e => handleChange(emp.id,'promoYearAssistant2',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant1||''} onChange={e => handleChange(emp.id,'promoYearAssistant1',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearChief||''} onChange={e => handleChange(emp.id,'promoYearChief',e.target.value)} className={inputCls} /></td>
`;

for (let i = 850; i < 900; i++) {
  if (lines[i] && lines[i].includes('bg-blue-100/50')) {
    lines[i] = lines[i].replace(thead1Target, thead1Replacement) + thead1New;
    break;
  }
}

for (let i = 870; i < 920; i++) {
  if (lines[i] && lines[i].includes('sortKey="nextExclude"')) {
    // Add border-r to nextExclude if it doesn't have it
    lines[i] = lines[i].replace('className="bg-blue-50/50"', 'className="bg-blue-50/50 border-r"');
    lines.splice(i + 1, 0, thead2New);
    break;
  }
}

for (let i = 950; i < 990; i++) {
  if (lines[i] && lines[i].includes('handleChange(emp.id,\'nextExclude\'')) {
    lines.splice(i + 1, 0, tbodyNew);
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
