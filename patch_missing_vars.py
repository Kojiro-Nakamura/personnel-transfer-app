import sys

with open('src/utils/exportHtml.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace getGradeLevelLocal with getGradeLevel
text = text.replace('getGradeLevelLocal', 'getGradeLevel')

# Add missing definitions
target = '''  const historyYears = Array.from(yearsSet).sort((a, b) => b - a);'''
repl = '''  const historyYears = Array.from(yearsSet).sort((a, b) => b - a);

  const getEraSuffixLocal = (y) => {
    const eraStr = getEraFormattedYear(y);
    const match = eraStr.match(/([RSHM])(\\d+)/);
    return match ? `${match[1]}${match[2]}` : String(y).substring(2);
  };

  const gradeToPromoKey = {
    '主任級': 'promoYearChief',
    '主査級（１）': 'promoYearAssistant1',
    '主査級（２）': 'promoYearAssistant2',
    '主査級（３）': 'promoYearAssistant3',
    '課長級': 'promoYearSecHead',
    '所属長級': 'promoYearDivHead',
    '次長級': 'promoYearDeputyHead',
    '部長級': 'promoYearDeptHead'
  };
'''

if target in text:
    text = text.replace(target, repl)
    print("Definitions added")
else:
    print("Target not found")

with open('src/utils/exportHtml.js', 'w', encoding='utf-8') as f:
    f.write(text)
