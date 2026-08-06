import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');

const t = `  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
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

const t_crlf = t.replace(/\n/g, '\r\n');

if (content.includes(t)) {
  content = content.replace(t, "");
} else if (content.includes(t_crlf)) {
  content = content.replace(t_crlf, "");
}

const insertionPoint = `  }, [isOpen, initialData]);
  
  if (!isOpen) return null;`;

const replacement = `  }, [isOpen, initialData]);

  const isPromoted = isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";
  const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[fd.nextGrade] : null;

  React.useEffect(() => {
    if (isOpen && isPromoted && activePromoKey) {
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
  }, [isOpen, isPromoted, activePromoKey, targetYear, fd.nextYears, fd[activePromoKey]]);
  
  if (!isOpen) return null;`;

const ip_crlf = insertionPoint.replace(/\n/g, '\r\n');
const rep_crlf = replacement.replace(/\n/g, '\r\n');

if (content.includes(insertionPoint)) {
  content = content.replace(insertionPoint, replacement);
} else if (content.includes(ip_crlf)) {
  content = content.replace(ip_crlf, rep_crlf);
}

fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
console.log('Fixed useEffect hook order');
