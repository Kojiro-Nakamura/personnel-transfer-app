const fs = require('fs');
const file = 'src/components/modals/Modals.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldCsv = `        emp.promoYearDeptHead || '',
        emp.promoYearDeputyHead || '',
        emp.promoYearDivHead || '',
        emp.promoYearSecHead || '',
        emp.promoYearAssistant3 || '',
        emp.promoYearAssistant2 || '',
        emp.promoYearAssistant1 || '',
        emp.promoYearChief || ''`;
const newCsv = `        emp.promoYearChief || '',
        emp.promoYearAssistant1 || '',
        emp.promoYearAssistant2 || '',
        emp.promoYearAssistant3 || '',
        emp.promoYearSecHead || '',
        emp.promoYearDivHead || '',
        emp.promoYearDeputyHead || '',
        emp.promoYearDeptHead || ''`;
content = content.replace(oldCsv, newCsv);

const oldTh = `                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50 border-l border-r" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r" />
                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50" />`;
const newTh = `                <Th label="係長級(主査)" sortKey="promoYearChief" className="bg-fuchsia-50/50 border-l border-r" />
                <Th label="補佐級I(主任)" sortKey="promoYearAssistant1" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級II(班長)" sortKey="promoYearAssistant2" className="bg-fuchsia-50/50 border-r" />
                <Th label="補佐級III" sortKey="promoYearAssistant3" className="bg-fuchsia-50/50 border-r" />
                <Th label="課長級" sortKey="promoYearSecHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="所属長級" sortKey="promoYearDivHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="次長級" sortKey="promoYearDeputyHead" className="bg-fuchsia-50/50 border-r" />
                <Th label="部長級" sortKey="promoYearDeptHead" className="bg-fuchsia-50/50" />`;
content = content.replace(oldTh, newTh);

const oldTd = `                    <td className="bg-fuchsia-50/30 border-l"><input type="number" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeputyHead||''} onChange={e => handleChange(emp.id,'promoYearDeputyHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDivHead||''} onChange={e => handleChange(emp.id,'promoYearDivHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearSecHead||''} onChange={e => handleChange(emp.id,'promoYearSecHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant3||''} onChange={e => handleChange(emp.id,'promoYearAssistant3',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant2||''} onChange={e => handleChange(emp.id,'promoYearAssistant2',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant1||''} onChange={e => handleChange(emp.id,'promoYearAssistant1',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearChief||''} onChange={e => handleChange(emp.id,'promoYearChief',e.target.value)} className={inputCls} /></td>`;
const newTd = `                    <td className="bg-fuchsia-50/30 border-l"><input type="number" value={emp.promoYearChief||''} onChange={e => handleChange(emp.id,'promoYearChief',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant1||''} onChange={e => handleChange(emp.id,'promoYearAssistant1',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant2||''} onChange={e => handleChange(emp.id,'promoYearAssistant2',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearAssistant3||''} onChange={e => handleChange(emp.id,'promoYearAssistant3',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearSecHead||''} onChange={e => handleChange(emp.id,'promoYearSecHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDivHead||''} onChange={e => handleChange(emp.id,'promoYearDivHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeputyHead||''} onChange={e => handleChange(emp.id,'promoYearDeputyHead',e.target.value)} className={inputCls} /></td>
                    <td className="bg-fuchsia-50/30"><input type="number" value={emp.promoYearDeptHead||''} onChange={e => handleChange(emp.id,'promoYearDeptHead',e.target.value)} className={inputCls} /></td>`;
content = content.replace(oldTd, newTd);

fs.writeFileSync(file, content, 'utf8');
