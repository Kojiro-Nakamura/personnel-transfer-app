import re
with open("src/App.jsx", "r", encoding="utf8") as f:
    code = f.read()

t_search = """        if (updates.length > 0) {
          mutations.bulkProcessEmployees(updates);
          alert(`${matchCount}件のデータを上書きしました。`);
        } else {
          alert('氏名と職員番号が一致する職員が見つかりませんでした。');
        }"""

t_replace = """        if (updates.length > 0) {
          openModal('partialImportConfirm', updates);
        } else {
          alert('氏名と職員番号が一致する職員が見つかりませんでした。');
        }"""

if t_search in code:
    code = code.replace(t_search, t_replace)
    with open("src/App.jsx", "w", encoding="utf8") as f:
        f.write(code)
    print("handlePartialImport updated!")
else:
    print("Could not find the target text!")