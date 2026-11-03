with open("src/App.jsx", "r", encoding="utf8") as f:
    lines = f.readlines()

new_lines = []
for i in range(len(lines)):
    if "<span className=\"font-bold text-sm text-slate-50\">来年度の配属先の枠をクリックしてください</span>" in lines[i]:
        new_lines.append(lines[i].replace(
            '<span className="font-bold text-sm text-slate-50">来年度の配属先の枠をクリックしてください</span>',
            '<span className="font-bold text-[13px] text-slate-50">来年度の配属先の枠をクリックしてください</span>'
        ))
        new_lines.append("""                <button
                  onClick={(e) => { e.stopPropagation(); openModal('emp', selEmp); }}
                  className="bg-sky-600 hover:bg-sky-500 text-white px-3 py-1 ml-3 rounded text-[11px] font-bold transition-colors flex items-center shadow-sm border border-sky-400"
                  title="職員の情報を編集"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  職員情報を編集
                </button>\n""")
    elif "職員編集" in lines[i] and "<Edit2" in lines[i-1]:
        # Delete this button by skipping the surrounding lines
        pass
    else:
        new_lines.append(lines[i])

with open("src/App.jsx", "w", encoding="utf8") as f:
    f.writelines(new_lines)