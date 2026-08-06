import sys
import os

modals_path = 'src/components/modals/Modals.jsx'
app_path = 'src/App.jsx'
export_html_path = 'src/utils/exportHtml.js'

with open(modals_path, 'r', encoding='utf-8') as f:
    modals_text = f.read()

# Find handleExportHTML
start_idx = modals_text.find('const handleExportHTML = () => {')
if start_idx == -1:
    print("Could not find handleExportHTML")
    sys.exit(1)

# Find the end of handleExportHTML
braces = 0
end_idx = -1
for i in range(start_idx, len(modals_text)):
    if modals_text[i] == '{':
        braces += 1
    elif modals_text[i] == '}':
        braces -= 1
        if braces == 0:
            end_idx = i
            break

handle_export_code = modals_text[start_idx:end_idx+1]

# Extract the body of handleExportHTML and create the utility function
# We need to make sure dependencies are imported in exportHtml.js
export_html_content = '''import { getGradeLevel, getEraFormattedYear, calculateAge, getPlacementName } from './helpers.js';

export const generateAndDownloadHTML = (employees, departments, targetYear) => {
''' + handle_export_code[handle_export_code.find('{')+1:handle_export_code.rfind('}')] + '''
};
'''

# The original handleExportHTML had local helpers like getGradeLevelLocal.
# Let's remove them or keep them since they are inside the body.
# Actually, it's safe to just wrap the body.

with open(export_html_path, 'w', encoding='utf-8') as f:
    f.write(export_html_content)

# Update Modals.jsx
repl_modals_logic = '''import { generateAndDownloadHTML } from '../../utils/exportHtml.js';

''' + modals_text[:start_idx] + '''  const handleExportHTML = () => {
    generateAndDownloadHTML(employees, departments, targetYear);
  };''' + modals_text[end_idx+1:]

# Change button name in Modals.jsx
repl_modals_logic = repl_modals_logic.replace(
    '<FileCode className="w-3.5 h-3.5" />HTML保存',
    '<FileCode className="w-3.5 h-3.5" />職員一覧HTML'
)

# Fix double imports if we just concatenated
if 'import { generateAndDownloadHTML }' not in modals_text:
    import_idx = repl_modals_logic.find("import { useApp")
    repl_modals_logic = repl_modals_logic[:import_idx] + "import { generateAndDownloadHTML } from '../../utils/exportHtml.js';\n" + repl_modals_logic[import_idx:]
    # Remove the one we mistakenly put at the very beginning
    repl_modals_logic = repl_modals_logic.replace("import { generateAndDownloadHTML } from '../../utils/exportHtml.js';\n\nimport React", "import React")

with open(modals_path, 'w', encoding='utf-8') as f:
    f.write(repl_modals_logic)

# Now update App.jsx to add the button
with open(app_path, 'r', encoding='utf-8') as f:
    app_text = f.read()

# We need to import generateAndDownloadHTML
if 'import { generateAndDownloadHTML }' not in app_text:
    app_text = app_text.replace("import { cx }", "import { cx }\nimport { generateAndDownloadHTML } from './utils/exportHtml.js';")
    if "import { generateAndDownloadHTML }" not in app_text:
        # Fallback if cx is not imported like that
        import_idx = app_text.find("import { useApp")
        app_text = app_text[:import_idx] + "import { generateAndDownloadHTML } from './utils/exportHtml.js';\n" + app_text[import_idx:]

# Find "表HTML" button and add "職員一覧HTML" button next to it.
target_btn = '<button onClick={() => exportToHTML("人事異動案_配置表")} className="bg-slate-600 hover:bg-slate-500 active:scale-95 transition-all px-2 py-1 rounded text-xs ml-2">表HTML</button>'
repl_btn = '<button onClick={() => exportToHTML("人事異動案_配置表")} className="bg-slate-600 hover:bg-slate-500 active:scale-95 transition-all px-2 py-1 rounded text-xs ml-2">表HTML</button>\n          <button onClick={() => generateAndDownloadHTML(history.employees, history.departments, history.targetYear)} className="bg-slate-600 hover:bg-slate-500 active:scale-95 transition-all px-2 py-1 rounded text-xs ml-2">職員一覧HTML</button>'

app_text = app_text.replace(target_btn, repl_btn)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_text)

print("Done")
