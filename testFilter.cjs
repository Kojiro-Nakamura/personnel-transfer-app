const fs = require('fs');

const initialDataText = fs.readFileSync('./src/constants/initialData.js', 'utf8');
const configText = fs.readFileSync('./src/constants/config.js', 'utf8');

let INITIAL_DEPARTMENTS, INITIAL_EMPLOYEES, GRADE_LEVELS;

const mockModule = { exports: {} };
eval(configText.replace(/export const/g, 'const'));
GRADE_LEVELS = eval('GRADE_LEVELS');

eval(initialDataText.replace(/export const/g, 'const'));
INITIAL_DEPARTMENTS = eval('INITIAL_DEPARTMENTS');
INITIAL_EMPLOYEES = eval('INITIAL_EMPLOYEES');

const deptMap = {};
INITIAL_DEPARTMENTS.forEach(dept => {
  deptMap[dept.id] = { posts: {}, groups: {}, direct: { current: [], next: [] } };
  dept.posts?.forEach(post => {
    deptMap[dept.id].posts[post.id] = { current: [], next: [] };
  });
  dept.groups?.forEach(group => {
    deptMap[dept.id].groups[group.id] = { posts: {}, direct: { current: [], next: [] } };
    group.posts?.forEach(gp => {
      deptMap[dept.id].groups[group.id].posts[gp.id] = { current: [], next: [] };
    });
  });
});

INITIAL_EMPLOYEES.forEach(emp => {
  if (emp.currentDeptId && deptMap[emp.currentDeptId]) {
    const dId = emp.currentDeptId;
    if (emp.currentPostId && deptMap[dId].posts[emp.currentPostId]) {
      deptMap[dId].posts[emp.currentPostId].current.push(emp);
    } else if (emp.currentGroupId && deptMap[dId].groups[emp.currentGroupId]) {
      const g = deptMap[dId].groups[emp.currentGroupId];
      if (emp.currentGroupPostId && g.posts[emp.currentGroupPostId]) {
        g.posts[emp.currentGroupPostId].current.push(emp);
      } else {
        g.direct.current.push(emp);
      }
    } else {
      deptMap[dId].direct.current.push(emp);
    }
  }
  if (emp.departmentId && deptMap[emp.departmentId]) {
    const dId = emp.departmentId;
    if (emp.postId && deptMap[dId].posts[emp.postId]) {
      deptMap[dId].posts[emp.postId].next.push(emp);
    } else if (emp.groupId && deptMap[dId].groups[emp.groupId]) {
      const g = deptMap[dId].groups[emp.groupId];
      if (emp.groupPostId && g.posts[emp.groupPostId]) {
        g.posts[emp.groupPostId].next.push(emp);
      } else {
        g.direct.next.push(emp);
      }
    } else {
      deptMap[dId].direct.next.push(emp);
    }
  }
});

const getGradeLevel = (grade) => GRADE_LEVELS[grade] || 1;

const isGroupVisible = (group, gm, filterLevel) => {
  if (filterLevel === 0) return true;
  let hasVisible = false;

  const checkEmp = (emp) => {
    if (!emp) return;
    const lvl1 = emp.currentGrade ? getGradeLevel(emp.currentGrade) : 0;
    const lvl2 = emp.nextGrade ? getGradeLevel(emp.nextGrade) : 0;
    if (lvl1 >= filterLevel || lvl2 >= filterLevel) hasVisible = true;
  };

  group.posts?.forEach(post => {
    const gpd = gm.posts[post.id];
    if (!gpd) return;
    gpd.current.forEach(checkEmp);
    gpd.next.forEach(checkEmp);
  });
  
  if (hasVisible) return true;

  gm.direct?.current?.forEach(checkEmp);
  gm.direct?.next?.forEach(checkEmp);

  return hasVisible;
};

const rinsei = INITIAL_DEPARTMENTS.find(d => d.name.includes("林政部") || d.name.includes("森林整備"));
if (rinsei) {
  const dm = deptMap[rinsei.id];
  console.log("Department: " + rinsei.name);
  rinsei.groups?.forEach(grp => {
    const gm = dm.groups[grp.id];
    const visible = isGroupVisible(grp, gm, 4);
    
    // count
    let count = 0;
    gm.direct.current.forEach(e => count++);
    grp.posts?.forEach(post => gm.posts[post.id]?.current.forEach(e => count++));
    
    console.log(`Group: ${grp.name}, Visible(Level 4): ${visible}, Emps: ${count}`);
    
    if (visible) {
        gm.direct.current.forEach(e => console.log('  Direct Curr:', e.name, e.currentGrade, getGradeLevel(e.currentGrade)));
        gm.direct.next.forEach(e => console.log('  Direct Next:', e.name, e.nextGrade, getGradeLevel(e.nextGrade)));
        grp.posts?.forEach(post => {
            gm.posts[post.id]?.current.forEach(e => console.log('  Post Curr:', e.name, e.currentGrade, getGradeLevel(e.currentGrade)));
            gm.posts[post.id]?.next.forEach(e => console.log('  Post Next:', e.name, e.nextGrade, getGradeLevel(e.nextGrade)));
        });
    }
  });
}
