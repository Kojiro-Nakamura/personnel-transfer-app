import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const anchor1 = "export const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {\n  const p = isCurrent ? 'current' : 'next';";
const replacement1 = `export const EmployeeFormSection = ({ title, isCurrent, disabled, fd, setFd, departments, editCurrent, setEditCurrent }) => {
  const { targetYear } = useApp();
  const p = isCurrent ? 'current' : 'next';`;

const anchor2 = "  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : \"\";\n\n  return (";
const replacement2 = `  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";

  const handleGradeChange = (v) => {
    let updates = { [\`\${p}Grade\`]: v };
    if (!isCurrent && isPromotedGrade(fd.currentGrade, v)) {
      updates.nextYears = 1;
      const gradeToPromoKey = {
        "係長級(主査)": "promoYearChief",
        "補佐級I(主任)": "promoYearAssistant1",
        "補佐級II(班長)": "promoYearAssistant2",
        "補佐級III(補佐兼班長)": "promoYearAssistant3",
        "課長級": "promoYearSecHead",
        "所属長級": "promoYearDivHead",
        "次長級": "promoYearDeputyHead",
        "部長級": "promoYearDeptHead"
      };
      const promoKey = gradeToPromoKey[v];
      if (promoKey) {
        updates[promoKey] = String(targetYear);
      }
    }
    setFd({ ...fd, ...updates });
  };

  return (`;

const anchor3 = "<FormSelect label=\"級\" disabled={disabled} value={fd[`${p}Grade`]} onChange={v => setFd({...fd, [`${p}Grade`]: v})} options={GRADE_OPTIONS} className=\"w-[140px]\" selectClassName={promoBg} />";
const replacement3 = "<FormSelect label=\"級\" disabled={disabled} value={fd[`${p}Grade`]} onChange={handleGradeChange} options={GRADE_OPTIONS} className=\"w-[140px]\" selectClassName={promoBg} />";

const anchor4 = "<FormInput label=\"年数\" type=\"number\" disabled={disabled} value={fd[`${p}Years`]} onChange={v => setFd({...fd, [`${p}Years`]: v})} className=\"w-16\" />";
const replacement4 = "<FormInput label=\"年数\" type=\"number\" disabled={disabled} value={fd[`${p}Years`]} onChange={v => setFd({...fd, [`${p}Years`]: v})} className=\"w-16\" inputClassName={promoBg} />";


// Handle CRLF variants
const a1_crlf = anchor1.replace(/\n/g, '\r\n');
const r1_crlf = replacement1.replace(/\n/g, '\r\n');
const a2_crlf = anchor2.replace(/\n/g, '\r\n');
const r2_crlf = replacement2.replace(/\n/g, '\r\n');

if (content.includes(anchor1)) content = content.replace(anchor1, replacement1);
else if (content.includes(a1_crlf)) content = content.replace(a1_crlf, r1_crlf);

if (content.includes(anchor2)) content = content.replace(anchor2, replacement2);
else if (content.includes(a2_crlf)) content = content.replace(a2_crlf, r2_crlf);

if (content.includes(anchor3)) content = content.replace(anchor3, replacement3);
if (content.includes(anchor4)) content = content.replace(anchor4, replacement4);

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Patched EmployeeComponents.jsx');
