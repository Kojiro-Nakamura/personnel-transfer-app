import fs from 'fs';
let content = fs.readFileSync('src/components/employee/EmployeeComponents.jsx', 'utf8');
const target = `  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';

  return (`;
const replacement = `  const pg = isCurrent ? 'currentGroupId' : 'groupId'; 
  const pgp = isCurrent ? 'currentGroupPostId' : 'groupPostId';

  const isPromoted = !isCurrent && isPromotedGrade(fd.currentGrade, fd.nextGrade);
  const promoBg = isPromoted ? getPromotedBgClass(fd.nextGrade) : "";

  return (`;
const regexTarget = target.replace(/\r?\n/g, '\\r?\\n').replace(/\(/g, '\\(').replace(/\)/g, '\\)').replace(/\[/g, '\\[').replace(/\]/g, '\\]').replace(/\{/g, '\\{').replace(/\}/g, '\\}').replace(/\+/g, '\\+').replace(/\?/g, '\\?').replace(/\./g, '\\.');

if(content.match(new RegExp(regexTarget))) {
  content = content.replace(new RegExp(regexTarget), replacement);
  fs.writeFileSync('src/components/employee/EmployeeComponents.jsx', content);
  console.log('Fixed EmployeeFormSection');
} else {
  console.log('Target not found');
}
