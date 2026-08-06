import sys

with open('src/hooks/useAppMutations.js', 'r', encoding='utf-8') as f:
    text = f.read()

target = '''      const sg = prev.filter(e => src 
        ? (e.currentDeptId === emp.currentDeptId && e.currentPostId === emp.currentPostId && e.currentGroupId === emp.currentGroupId && e.currentGroupPostId === emp.currentGroupPostId) 
        : (e.departmentId === emp.departmentId && e.postId === emp.postId && e.groupId === emp.groupId && e.groupPostId === emp.groupPostId)
      ).sort((a, b) => (a[k] || 0) - (b[k] || 0));'''

repl = '''      const sg = prev.filter(e => {
        if (src) {
          if (emp.currentDeptId === 'unassigned' || emp.currentDeptId === 'retired') return e.currentDeptId === emp.currentDeptId;
          return e.currentDeptId === emp.currentDeptId && (e.currentPostId||null) === (emp.currentPostId||null) && (e.currentGroupId||null) === (emp.currentGroupId||null) && (e.currentGroupPostId||null) === (emp.currentGroupPostId||null);
        } else {
          if (emp.departmentId === 'unassigned' || emp.departmentId === 'retired') return e.departmentId === emp.departmentId;
          return e.departmentId === emp.departmentId && (e.postId||null) === (emp.postId||null) && (e.groupId||null) === (emp.groupId||null) && (e.groupPostId||null) === (emp.groupPostId||null);
        }
      }).sort((a, b) => (a[k] || 0) - (b[k] || 0));'''

if target in text:
    text = text.replace(target, repl)
    print("Replaced filtering logic in moveEmployee.")
else:
    print("Error: Target not found in useAppMutations.js.")

with open('src/hooks/useAppMutations.js', 'w', encoding='utf-8') as f:
    f.write(text)
