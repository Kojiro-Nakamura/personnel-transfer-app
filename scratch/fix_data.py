import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("export const addCurrentBasePlanSheet")
if start != -1:
    func_code = code[start:]
    pre_code = code[:start]

    # main loop data
    old_data = """        if (isRetired) {
          vals[10] = '退職';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
        } else if (isUnassigned) {
          vals[10] = '未配置';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
          vals[16] = emp.nextEmploymentType || '';
        } else {
          vals[10] = getDeptNameStr(emp.departmentId);
          vals[11] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[12] = emp.nextTitle || '';
          vals[13] = emp.nextGrade || '';
          vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('・');
          vals[15] = ns ? `${ny}年(${ns})` : `${ny}年`;
          vals[16] = emp.nextEmploymentType || '';
        }"""
        
    new_data = """        if (isRetired) {
          vals[9] = '退職';
          vals[13] = calculateAge(emp.birthDate, targetYear);
        } else if (isUnassigned) {
          vals[9] = '未配置';
          vals[13] = calculateAge(emp.birthDate, targetYear);
          vals[15] = emp.nextEmploymentType || '';
        } else {
          vals[9] = getDeptNameStr(emp.departmentId);
          vals[10] = getGroupNameStr(emp.departmentId, emp.groupId);
          vals[11] = emp.nextTitle || '';
          vals[12] = emp.nextGrade || '';
          vals[13] = calculateAge(emp.birthDate, targetYear);
          const ny = emp.nextYears || 0;
          const ns = (emp.nextSkills || []).join('・');
          vals[14] = ns ? `${ny}(${ns})` : `${ny}`;
          vals[15] = emp.nextEmploymentType || '';
        }"""
        
    func_code = func_code.replace(old_data, new_data)
    
    func_code = func_code.replace("vals[6] = calculateAge(emp.birthDate, targetYear - 1) !== '' ? calculateAge(emp.birthDate, targetYear - 1) + '歳' : '';",
                                  "vals[6] = calculateAge(emp.birthDate, targetYear - 1);")
                                  
    func_code = func_code.replace("vals[7] = cs ? `${cy}年(${cs})` : `${cy}年`;",
                                  "vals[7] = cs ? `${cy}(${cs})` : `${cy}`;")
                                  
    func_code = func_code.replace("vals[8] = emp.currentEmploymentType || '';\n          vals[9] = '→';",
                                  "vals[8] = '→';")

    # unassigned loop data
    old_unassigned_data = """      v[6] = calculateAge(emp.birthDate, targetYear - 1) !== '' ? calculateAge(emp.birthDate, targetYear - 1) + '歳' : '';
      const cy = emp.currentYears || 0;
      const cs = (emp.currentSkills || []).join('・');
      v[7] = cs ? `${cy}年(${cs})` : `${cy}年`;
      v[8] = emp.currentEmploymentType || '';
      v[9] = '→';
      v[10] = getDeptNameStr(emp.departmentId);
      v[11] = getGroupNameStr(emp.departmentId, emp.groupId);
      v[12] = emp.nextTitle || '';
      v[13] = emp.nextGrade || '';
      v[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';
      const ny = emp.nextYears || 0;
      const ns = (emp.nextSkills || []).join('・');
      v[15] = ns ? `${ny}年(${ns})` : `${ny}年`;
      v[16] = emp.nextEmploymentType || '';"""
      
    new_unassigned_data = """      v[6] = calculateAge(emp.birthDate, targetYear - 1);
      const cy = emp.currentYears || 0;
      const cs = (emp.currentSkills || []).join('・');
      v[7] = cs ? `${cy}(${cs})` : `${cy}`;
      v[8] = '→';
      v[9] = getDeptNameStr(emp.departmentId);
      v[10] = getGroupNameStr(emp.departmentId, emp.groupId);
      v[11] = emp.nextTitle || '';
      v[12] = emp.nextGrade || '';
      v[13] = calculateAge(emp.birthDate, targetYear);
      const ny = emp.nextYears || 0;
      const ns = (emp.nextSkills || []).join('・');
      v[14] = ns ? `${ny}(${ns})` : `${ny}`;
      v[15] = emp.nextEmploymentType || '';"""
      
    func_code = func_code.replace(old_unassigned_data, new_unassigned_data)

    code = pre_code + func_code

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)