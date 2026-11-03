import os

with open("src/utils/exportExcel.js", "r", encoding="utf8") as f:
    code = f.read()

start = code.find("vals[3] = emp.currentTitle || '';")
if start != -1:
    end = code.find("row.values = vals;", start)
    if end != -1:
        old_block = code[start:end]
        
        # Now I will replace specific lines in the old_block
        new_block = old_block
        
        # We already have vals[6] and vals[7] fixed. Let's make sure.
        new_block = new_block.replace("vals[6] = calculateAge(emp.birthDate, targetYear - 1) !== '' ? calculateAge(emp.birthDate, targetYear - 1) + '歳' : '';", "vals[6] = calculateAge(emp.birthDate, targetYear - 1);")
        new_block = new_block.replace("vals[7] = cs ? `${cy}年(${cs})` : `${cy}年`;", "vals[7] = cs ? `${cy}(${cs})` : `${cy}`;")
        
        # Remove vals[8] and shift everything
        # Currently we have:
        # vals[8] = emp.currentEmploymentType || '';
        # 
        # vals[9] = '→';
        # ...
        
        # So we want to replace `vals[8] = ... \n vals[9] = ...` with just `vals[8] = ...`
        new_block = new_block.replace("vals[8] = emp.currentEmploymentType || '';", "")
        new_block = new_block.replace("vals[9] = '→';", "vals[8] = '→';")
        
        new_block = new_block.replace("vals[10] = '退職';", "vals[9] = '退職';")
        new_block = new_block.replace("vals[10] = '未配置';", "vals[9] = '未配置';")
        new_block = new_block.replace("vals[14] = calculateAge(emp.birthDate, targetYear) !== '' ? calculateAge(emp.birthDate, targetYear) + '歳' : '';", "vals[13] = calculateAge(emp.birthDate, targetYear);")
        new_block = new_block.replace("vals[16] = emp.nextEmploymentType || '';", "vals[15] = emp.nextEmploymentType || '';")
        new_block = new_block.replace("vals[10] = getDeptNameStr(emp.departmentId);", "vals[9] = getDeptNameStr(emp.departmentId);")
        new_block = new_block.replace("vals[11] = getGroupNameStr(emp.departmentId, emp.groupId);", "vals[10] = getGroupNameStr(emp.departmentId, emp.groupId);")
        new_block = new_block.replace("vals[12] = emp.nextTitle || '';", "vals[11] = emp.nextTitle || '';")
        new_block = new_block.replace("vals[13] = emp.nextGrade || '';", "vals[12] = emp.nextGrade || '';")
        
        new_block = new_block.replace("vals[15] = ns ? `${ny}年(${ns})` : `${ny}年`;", "vals[14] = ns ? `${ny}(${ns})` : `${ny}`;")
        
        code = code.replace(old_block, new_block)

with open("src/utils/exportExcel.js", "w", encoding="utf8") as f:
    f.write(code)