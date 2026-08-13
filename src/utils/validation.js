import { isPromotedGrade } from './helpers.js';
import { GRADE_TO_PROMO_KEY } from '../constants/config.js';

export const validateEmployees = (employees, targetYear) => {
  const warnings = [];

  const PROMO_KEYS = ['promoYearChief', 'promoYearAssistant1', 'promoYearAssistant2', 'promoYearAssistant3', 'promoYearSecHead', 'promoYearDivHead', 'promoYearDeputyHead', 'promoYearDeptHead'];

  employees.forEach(emp => {
    // Skip unassigned/retired
    if (emp.departmentId === 'unassigned' || emp.departmentId === 'retired') return;

    const isPromoted = isPromotedGrade(emp.currentGrade, emp.nextGrade);
    const activePromoKey = isPromoted ? GRADE_TO_PROMO_KEY[emp.nextGrade] : null;

    let hasTargetYearPromo = false;
    PROMO_KEYS.forEach(k => {
      if (emp[k] === String(targetYear) || emp[k] === targetYear) {
        hasTargetYearPromo = true;
      }
    });

    // 1. 昇進年度の未設定・消し忘れ
    if (isPromoted) {
      if (activePromoKey && emp[activePromoKey] !== String(targetYear) && emp[activePromoKey] !== targetYear) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: 'MISSING_PROMO_YEAR',
          message: `来年度の級が上がっていますが、対象の昇進年度（${targetYear}年度）が正しく設定されていません。`
        });
      }
    } else {
      if (hasTargetYearPromo) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: 'STALE_PROMO_YEAR',
          message: `来年度の級は上がっていませんが、昇進年度に今年度(${targetYear})が残っています。昇進取り消し時の消し忘れの可能性があります。`
        });
      }
    }

    // 2. 経過年数の矛盾
    if (isPromoted) {
      if (Number(emp.nextYears) !== 1) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: 'INVALID_NEXT_YEARS_PROMOTED',
          message: `昇進しているため経過年数は「1年」になるはずですが、現在「${emp.nextYears}年」になっています。`
        });
      }
    } else {
      const isSamePlacement = emp.currentDeptId === emp.departmentId && emp.currentPostId === emp.postId && emp.currentGroupId === emp.groupId && emp.currentGroupPostId === emp.groupPostId;
      if (isSamePlacement) {
        const expectedYears = (Number(emp.currentYears) || 0) + 1;
        if (Number(emp.nextYears) !== expectedYears && Number(emp.nextYears) === 1) {
          warnings.push({
            empId: emp.id,
            empName: emp.name,
            type: 'INVALID_NEXT_YEARS_SAME_PLACEMENT',
            message: `配置と級が変わっていませんが、経過年数が「1年」にリセットされています。本来は「${expectedYears}年」です。`
          });
        }
      }
    }

    // 3. 役職と級の不整合（明らかなもの）
    if (emp.nextTitle && emp.nextGrade) {
      const title = emp.nextTitle;
      const grade = emp.nextGrade;
      let mismatch = false;
      let expectedGradeStr = "";

      if (title.includes('部長') && !title.includes('次長') && !title.includes('課長')) {
        if (grade !== '部長級') { mismatch = true; expectedGradeStr = "部長級"; }
      } else if (title.includes('次長')) {
        if (grade !== '次長級') { mismatch = true; expectedGradeStr = "次長級"; }
      } else if (title === '課長' || title === '室長') {
        if (grade !== '課長級') { mismatch = true; expectedGradeStr = "課長級"; }
      } else if (grade === '部長級' && !title.includes('部長')) {
         mismatch = true; expectedGradeStr = "部長を含む役職";
      }

      if (mismatch) {
        warnings.push({
          empId: emp.id,
          empName: emp.name,
          type: 'TITLE_GRADE_MISMATCH',
          message: `役職「${title}」に対して級「${grade}」が一致していない可能性があります（想定: ${expectedGradeStr}）。`
        });
      }
    }
  });

  return warnings;
};
