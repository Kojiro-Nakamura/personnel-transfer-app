import { isPromotedGrade, calcNextSkills } from './helpers.js';
import { GRADE_TO_PROMO_KEY } from '../constants/config.js';

export const validateEmployees = (employees, targetYear, departments) => {
  const warnings = [];

  const PROMO_KEYS = ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];

  employees.forEach(emp => {
    // Skip unassigned/retired
    if (emp.departmentId === 'unassigned' || emp.departmentId === 'retired') return;

    const isPromoted = isPromotedGrade(emp.currentGrade, emp.nextGrade);
    const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[emp.nextGrade] : null;

    let hasTargetYearPromo = false;
    PROMO_KEYS.forEach(k => {
      if (emp[k] && String(emp[k]).startsWith(String(targetYear))) {
        hasTargetYearPromo = true;
      }
    });

    // 1. 昇進年度の未設定・消し忘れ
    if (isPromoted) {
      if (activePromoKey && !(emp[activePromoKey] && String(emp[activePromoKey]).startsWith(String(targetYear)))) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: '昇進年度未設定',
          message: `来年度の級が上がっていますが、対象の昇進年度（${targetYear}年度）が正しく設定されていません。`
        });
      }
    } else {
      if (hasTargetYearPromo) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: '昇進年度消し忘れ',
          message: `来年度の級は上がっていませんが、昇進年度に今年度(${targetYear})が残っています。昇進取り消し時の消し忘れの可能性があります。`
        });
      }
    }

    // 2. 経過年数の矛盾
    const isSameDept = emp.currentDeptId === emp.departmentId;
    const isSamePlacement = isSameDept && emp.currentPostId === emp.postId && emp.currentGroupId === emp.groupId && emp.currentGroupPostId === emp.groupPostId;
    
    let expectedNextYears;
    if (isSameDept) {
      expectedNextYears = (Number(emp.currentYears) || 0) + 1;
    } else {
      expectedNextYears = 1;
    }

    if (Number(emp.nextYears) !== expectedNextYears) {
      warnings.push({
        empId: emp.id,
        empName: emp.name,
        type: '経過年数矛盾',
        message: `配置変更ルールに基づくと経過年数は「${expectedNextYears}年」になるはずですが、現在「${emp.nextYears}年」になっています。`
      });
    }

    // 3. 役職と級の不整合（明らかなもの）
    if (emp.nextTitle && emp.nextGrade) {
      const title = emp.nextTitle;
      const grade = emp.nextGrade;
      let mismatch = false;
      let expectedGradeStr = "";
      let isShinkoukyoku = false;
      if (departments && emp.departmentId) {
        const dept = departments.find(d => d.id === emp.departmentId);
        if (dept && dept.name.includes('振興局')) {
          isShinkoukyoku = true;
        }
      }

      if (title.includes('部長') && !title.includes('次長') && !title.includes('課長')) {
        if (grade !== '部長級') { mismatch = true; expectedGradeStr = "部長級"; }
      } else if (title.includes('次長')) {
        if (grade !== '次長級') { mismatch = true; expectedGradeStr = "次長級"; }
      } else if (title === '課長' || title === '室長') {
        if (isShinkoukyoku && title === '課長') {
          // 振興局の課長は補佐級II（班長）などでなければならない
          if (!grade.includes('補佐級') && !grade.includes('班長')) {
            mismatch = true; expectedGradeStr = "補佐級II（班長）";
          }
        } else {
          // 通常の課長・室長は課長級でなければならない
          if (grade !== '課長級') {
            mismatch = true; expectedGradeStr = "課長級";
          }
        }
      } else if (grade === '部長級' && !title.includes('部長')) {
         mismatch = true; expectedGradeStr = "部長を含む役職";
      }

      if (mismatch) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: '役職と級の不整合',
          message: `役職「${title}」に対して級「${grade}」が一致していない可能性があります（想定: ${expectedGradeStr}）。`
        });
      }
    }

    // 4. ポスト名と本人の職名の不整合
    if (departments) {
      const dept = departments.find(d => d.id === emp.departmentId);
      if (dept) {
        let postName = '';
        if (emp.postId) {
          const post = (dept.posts || []).find(p => p.id === emp.postId);
          if (post) postName = post.nextName || post.name;
        } else if (emp.groupId) {
          const group = (dept.groups || []).find(g => g.id === emp.groupId);
          if (group && emp.groupPostId) {
            const gp = (group.posts || []).find(p => p.id === emp.groupPostId);
            if (gp) postName = gp.nextName || gp.name;
          }
        }
        
        let isPostMismatch = false;
        if (postName === '班長') {
          if (!emp.nextTitle || !emp.nextTitle.includes('班長')) {
            isPostMismatch = true;
          }
        } else if (postName && postName !== 'GL' && postName !== emp.nextTitle) {
          isPostMismatch = true;
        }

        if (isPostMismatch) {
          warnings.push({
            empId: emp.id,
            empName: emp.name,
            type: 'ポストと職名の不整合',
            message: `来年度の配置先ポスト名（${postName}）と、本人の職名（${emp.nextTitle || 'なし'}）が異なります。`
          });
        }
      }
    }
  });

  if (departments) {
    departments.forEach(d => {
      if (d.type !== 'regular') return;
      
      const checkSlot = (dId, pId, gId, gpId, locationStr, postName) => {
        if (postName === 'GL') return;

        const currEmps = employees.filter(e => e.currentDeptId === dId && e.currentPostId === pId && e.currentGroupId === gId && e.currentGroupPostId === gpId);
        const nextEmps = employees.filter(e => e.departmentId === dId && e.postId === pId && e.groupId === gId && e.groupPostId === gpId);

        if (currEmps.length > 0 && nextEmps.length > 0) {
          const cEmp = currEmps[0];
          const nEmp = nextEmps[0];
          const cTitle = cEmp.currentTitle || 'なし';
          const nTitle = nEmp.nextTitle || 'なし';

          if (cTitle !== nTitle) {
            warnings.push({
              empId: nEmp.id,
              type: 'ポスト職名変更',
              targetName: locationStr,
              message: `同じポスト枠で今年度と来年度の職名が異なります。\n（今年度: ${cTitle} ${cEmp.name} → 来年度: ${nTitle} ${nEmp.name}）`
            });
          }
        }
      };

      (d.posts || []).forEach(p => checkSlot(d.id, p.id, null, null, `${d.name} ${p.name}`, p.name));
      (d.groups || []).forEach(g => {
        (g.posts || []).forEach(gp => checkSlot(d.id, null, g.id, gp.id, `${d.name} ${g.name} ${gp.name}`, gp.name));
      });
    });
  }

  return warnings;
};

export const autoFixEmployees = (employees, targetYear, departments) => {
  const newEmps = JSON.parse(JSON.stringify(employees));
  const fixes = [];
  const PROMO_KEYS = ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];

  newEmps.forEach(emp => {
    if (emp.departmentId === 'unassigned' || emp.departmentId === 'retired') return;

    let fixedThisEmp = false;
    const messages = [];

    const isPromoted = isPromotedGrade(emp.currentGrade, emp.nextGrade);
    const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[emp.nextGrade] : null;

    const isSameDept = emp.currentDeptId === emp.departmentId;
    const isSamePost = isSameDept && emp.currentPostId === emp.postId && emp.currentGroupId === emp.groupId && emp.currentGroupPostId === emp.groupPostId;

    // 0. Normalize Date Formats
    ['hireDate', ...PROMO_KEYS].forEach(k => {
      if (emp[k]) {
        const val = String(emp[k]).trim();
        // Match exactly 4 digits, or 4 digits followed by "年度" or "年"
        if (/^\d{4}$/.test(val) || /^\d{4}年度?$/.test(val)) {
          const year = val.replace(/\D/g, '');
          emp[k] = `${year}-04-01`;
          fixedThisEmp = true;
          messages.push(`日付フォーマットを修正(${k})`);
        }
      }
    });

    // 1. Promo Year Fixes
    if (isPromoted) {
      if (activePromoKey && !(emp[activePromoKey] && String(emp[activePromoKey]).startsWith(String(targetYear)))) {
        emp[activePromoKey] = `${targetYear}-04-01`;
        fixedThisEmp = true;
        messages.push(`昇進年度を${targetYear}年度に修正`);
      }
    }
    
    // Check and clear stale promo years regardless of isPromoted, but if promoted we don't clear the active one
    PROMO_KEYS.forEach(k => {
      if (k !== activePromoKey && (emp[k] && String(emp[k]).startsWith(String(targetYear)))) {
        emp[k] = '';
        fixedThisEmp = true;
        messages.push(`誤った昇進年度をクリア`);
      }
    });

    // 2. Years and Skills Fixes
    let expectedNextYears = emp.nextYears;
    let expectedNextSkills = [...(emp.nextSkills || [])];

    if (isSameDept) {
      expectedNextYears = (Number(emp.currentYears) || 0) + 1;
    } else {
      expectedNextYears = 1;
    }

    if (isPromoted) {
      if (isSamePost) {
        // Pattern E: same post, promoted -> keep history
        expectedNextSkills = [...(emp.currentSkills || [])];
      } else if (isSameDept) {
        // Pattern D: same dept, different post, promoted
        expectedNextSkills = calcNextSkills(emp.currentSkills, emp.currentYears, false, true);
      } else {
        // Pattern A: different dept, promoted
        expectedNextSkills = ['1'];
      }
    } else {
      if (!isSameDept) {
        // Pattern A: different dept
        expectedNextSkills = ['1'];
      } else if (!isSamePost) {
        // Pattern B: same dept, different post
        expectedNextSkills = calcNextSkills(emp.currentSkills, emp.currentYears, false, true);
      } else {
        // Pattern C: same dept, same post
        expectedNextSkills = calcNextSkills(emp.currentSkills, emp.currentYears, true, true);
      }
    }

    if (Number(emp.nextYears) !== Number(expectedNextYears)) {
      emp.nextYears = expectedNextYears;
      fixedThisEmp = true;
      messages.push(`経過年数を${expectedNextYears}年に修正`);
    }

    const currentSkillsStr = (emp.nextSkills || []).join(',');
    const expectedSkillsStr = expectedNextSkills.join(',');
    if (currentSkillsStr !== expectedSkillsStr) {
      emp.nextSkills = expectedNextSkills;
      fixedThisEmp = true;
      messages.push(`詳細年数を修正`);
    }



    if (fixedThisEmp) {
      // Deduplicate messages
      const uniqueMessages = [...new Set(messages)];
      fixes.push({
        empId: emp.id,
        empName: emp.name,
        type: 'AUTO_FIXED',
        message: uniqueMessages.join(' / ')
      });
    }
  });

  return { newEmps, fixes };
};
