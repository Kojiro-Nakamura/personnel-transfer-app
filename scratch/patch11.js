import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = "  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : '';\n\n  return (";
const t2 = "  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : '';\r\n\r\n  return (";

const r = `  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : '';

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
const r2 = r.replace(/\n/g, '\r\n');

if (content.includes(t)) {
  content = content.replace(t, r);
} else if (content.includes(t2)) {
  content = content.replace(t2, r2);
} else {
  console.log("Could not find anchor to insert handleGradeChange");
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Fixed EmployeeComponents');
