const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const logic = `
  const getLastPromoYear = () => {
    for (let i = pYears.length - 1; i >= 0; i--) {
      if (!isNaN(pYears[i].year)) return pYears[i].year;
    }
    return null;
  };
  const lastY = getLastPromoYear();
  const currentYear = targetYear - 1;
  const yearsSinceLast = lastY !== null ? (currentYear - lastY) : null;
`;

const uiNode = `              <div className="flex flex-col items-center mx-1 justify-end h-[62px]">
                <ArrowRight className="w-4 h-4 text-slate-300 mb-1" />
              </div>
              <div className="flex flex-col mb-1.5 ml-1">
                <span className="text-[11px] font-bold text-blue-700 mb-1">現在まで</span>
                <div className="px-3 py-1.5 bg-blue-100 border border-blue-200 text-blue-800 rounded text-sm font-bold shadow-inner">
                  {yearsSinceLast !== null ? Math.max(0, yearsSinceLast) + '年' : '----'}
                </div>
              </div>`;

// Insert useApp call
for (let i = 280; i < 290; i++) {
  if (lines[i].includes('const [fd, setFd] = useState(def);')) {
    lines.splice(i, 0, `  const { targetYear } = useApp();`);
    break;
  }
}

// Insert logic
for (let i = 320; i < 370; i++) {
  if (lines[i].includes('const ArrowDiff = ({ diff }) => {')) {
    lines.splice(i, 0, logic);
    break;
  }
}

// Insert UI node
for (let i = 380; i < 430; i++) {
  if (lines[i].includes('</div>') && lines[i-1].includes('promoYearDeptHead')) {
    lines.splice(i, 0, uiNode);
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
