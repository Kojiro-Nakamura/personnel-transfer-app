import sys

with open('src/contexts/AppContext.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

target_logic = '''      return { 
        ...e, 
        currentDeptId: e.departmentId, 
        currentPostId: e.postId, 
        currentGroupId: e.groupId, 
        currentGroupPostId: e.groupPostId, 
        currentGrade: e.nextGrade, 
        currentTitle: e.nextTitle, 
        currentYears: e.nextYears, 
        currentSkills: [...(e.nextSkills || [])], 
        currentEmploymentType: e.nextEmploymentType, 
        currentExclude: e.nextExclude || '',
        departmentId: 'unassigned', 
        postId: null, 
        groupId: null, 
        groupPostId: null, 
        nextYears: 1, 
        nextSkills: [], 
        nextEmploymentType: '', 
        nextExclude: '',
        orderCurrent: e.orderNext || Date.now(), 
        orderNext: Date.now(),
        history: newHistory
      };'''

repl_logic = '''      const gradeToPromoKey = {
        '主任級': 'promoYearChief',
        '主査級（１）': 'promoYearAssistant1',
        '主査級（２）': 'promoYearAssistant2',
        '主査級（３）': 'promoYearAssistant3',
        '課長級': 'promoYearSecHead',
        '所属長級': 'promoYearDivHead',
        '次長級': 'promoYearDeputyHead',
        '部長級': 'promoYearDeptHead'
      };

      let promoUpdates = {};
      if (getGradeLevel(e.nextGrade) > getGradeLevel(e.currentGrade)) {
        const promoKey = gradeToPromoKey[e.nextGrade];
        if (promoKey) {
          promoUpdates[promoKey] = history.targetYear.toString();
        }
      }

      return { 
        ...e, 
        ...promoUpdates,
        currentDeptId: e.departmentId, 
        currentPostId: e.postId, 
        currentGroupId: e.groupId, 
        currentGroupPostId: e.groupPostId, 
        currentGrade: e.nextGrade, 
        currentTitle: e.nextTitle, 
        currentYears: e.nextYears, 
        currentSkills: [...(e.nextSkills || [])], 
        currentEmploymentType: e.nextEmploymentType, 
        currentExclude: e.nextExclude || '',
        departmentId: 'unassigned', 
        postId: null, 
        groupId: null, 
        groupPostId: null, 
        nextYears: 1, 
        nextSkills: [], 
        nextEmploymentType: '', 
        nextExclude: '',
        orderCurrent: e.orderNext || Date.now(), 
        orderNext: Date.now(),
        history: newHistory
      };'''

if target_logic in text:
    text = text.replace(target_logic, repl_logic)
    print("handleRollOver updated.")
else:
    print("Could not find handleRollOver logic block.")

with open('src/contexts/AppContext.jsx', 'w', encoding='utf-8') as f:
    f.write(text)
