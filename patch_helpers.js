import fs from 'fs';
const content = fs.readFileSync('src/utils/helpers.js', 'utf8');
const buildDeptMapCode = 
export const buildDeptMap = (departments, employees) => {
  const unNext = { unassigned: [], retired: [] };
  const unCurr = { unassigned: [], retired: [] };
  const map = {};
  
  departments.forEach(d => {
    if (d.type !== 'regular') return;
    map[d.id] = { direct: { current: [], next: [] }, posts: {}, groups: {} };
    
    (d.posts || []).forEach(p => {
      map[d.id].posts[p.id] = { current: [], next: [] };
    });
    
    (d.groups || []).forEach(g => {
      map[d.id].groups[g.id] = { direct: { current: [], next: [] }, posts: {} };
      (g.posts || []).forEach(gp => {
        map[d.id].groups[g.id].posts[gp.id] = { current: [], next: [] };
      });
    });
  });
  
  employees.forEach(e => {
    const assignToMap = (emp, dId, pId, gId, gpId, isSrc, tMap) => {
      if (dId === 'unassigned') {
        tMap.unassigned.push(emp);
      } else if (dId === 'retired') {
        tMap.retired.push(emp);
      } else if (map[dId]) {
        const t = isSrc ? 'current' : 'next';
        if (pId && map[dId].posts[pId]) {
          map[dId].posts[pId][t].push(emp);
        } else if (gId && map[dId].groups[gId]) {
          const g = map[dId].groups[gId];
          if (gpId && g.posts[gpId]) {
            g.posts[gpId][t].push(emp);
          } else {
            g.direct[t].push(emp);
          }
        } else {
          map[dId].direct[t].push(emp);
        }
      }
    };
    
    assignToMap(e, e.currentDeptId, e.currentPostId, e.currentGroupId, e.currentGroupPostId, true, unCurr);
    assignToMap(e, e.departmentId, e.postId, e.groupId, e.groupPostId, false, unNext);
  });
  
  const srt = (arr, k) => arr.sort((a, b) => (a[k] || 0) - (b[k] || 0));
  
  Object.values(map).forEach(d => {
    srt(d.direct.current, 'orderCurrent');
    srt(d.direct.next, 'orderNext');
    Object.values(d.posts).forEach(p => {
      srt(p.current, 'orderCurrent');
      srt(p.next, 'orderNext');
    });
    Object.values(d.groups).forEach(g => {
      srt(g.direct.current, 'orderCurrent');
      srt(g.direct.next, 'orderNext');
      Object.values(g.posts).forEach(gp => {
        srt(gp.current, 'orderCurrent');
        srt(gp.next, 'orderNext');
      });
    });
  });
  
  srt(unCurr.unassigned, 'orderCurrent');
  srt(unNext.unassigned, 'orderNext');
  srt(unCurr.retired, 'orderCurrent');
  srt(unNext.retired, 'orderNext');
  
  return { deptMap: map, nextMap: unNext, currMap: unCurr };
};
;
if (!content.includes('export const buildDeptMap')) {
  fs.writeFileSync('src/utils/helpers.js', content + '\n' + buildDeptMapCode, 'utf8');
}
