import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";
  const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[fd.nextGrade] : null;`;
  
const t_crlf = t.replace(/\n/g, '\r\n');

const r = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";
  const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[fd.nextGrade] : null;

  React.useEffect(() => {
    if (isPromoted && activePromoKey) {
      let shouldUpdate = false;
      let updates = {};
      if (!fd[activePromoKey]) {
        updates[activePromoKey] = String(targetYear);
        shouldUpdate = true;
      }
      if (fd.nextYears !== 1 && fd.nextYears !== "1") {
        updates.nextYears = 1;
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        setFd(prev => ({ ...prev, ...updates }));
      }
    }
  }, [isPromoted, activePromoKey, targetYear, fd.nextYears, fd[activePromoKey]]);`;
const r_crlf = r.replace(/\n/g, '\r\n');

if (content.includes(t)) content = content.replace(t, r);
else if (content.includes(t_crlf)) content = content.replace(t_crlf, r_crlf);

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Added useEffect to EmployeeModal');
