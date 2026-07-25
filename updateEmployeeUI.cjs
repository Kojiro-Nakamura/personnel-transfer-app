const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const promoSection = `
          <div className="border border-slate-300 rounded p-3 mt-4">
            <h4 className="font-bold text-sm text-slate-700 mb-3">昇進年度 (西暦)</h4>
            <div className="grid grid-cols-4 gap-3">
              <FormInput label="係長級(主査)" type="number" placeholder="YYYY" value={fd.promoYearChief} onChange={v => setFd({...fd, promoYearChief: v})} />
              <FormInput label="補佐級I(主任)" type="number" placeholder="YYYY" value={fd.promoYearAssistant1} onChange={v => setFd({...fd, promoYearAssistant1: v})} />
              <FormInput label="補佐級II(班長)" type="number" placeholder="YYYY" value={fd.promoYearAssistant2} onChange={v => setFd({...fd, promoYearAssistant2: v})} />
              <FormInput label="補佐級III" type="number" placeholder="YYYY" value={fd.promoYearAssistant3} onChange={v => setFd({...fd, promoYearAssistant3: v})} />
              <FormInput label="課長級" type="number" placeholder="YYYY" value={fd.promoYearSecHead} onChange={v => setFd({...fd, promoYearSecHead: v})} />
              <FormInput label="所属長級" type="number" placeholder="YYYY" value={fd.promoYearDivHead} onChange={v => setFd({...fd, promoYearDivHead: v})} />
              <FormInput label="次長級" type="number" placeholder="YYYY" value={fd.promoYearDeputyHead} onChange={v => setFd({...fd, promoYearDeputyHead: v})} />
              <FormInput label="部長級" type="number" placeholder="YYYY" value={fd.promoYearDeptHead} onChange={v => setFd({...fd, promoYearDeptHead: v})} />
            </div>
          </div>
`;

content = content.replace(
  /<EmployeeFormSection title="今年度\(現行\)"/,
  promoSection + '\n          <div className="grid grid-cols-2 gap-4">\n            <EmployeeFormSection title="今年度(現行)"'
);

fs.writeFileSync(file, content, 'utf8');
