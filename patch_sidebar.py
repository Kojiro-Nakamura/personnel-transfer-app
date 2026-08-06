import sys

with open('src/components/layout/AppSidebar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Update SidebarCard signature
text = text.replace(
    'export const SidebarCard = ({ emp, isRetired, onClick }) => {',
    'export const SidebarCard = ({ emp, isRetired, onClick, onMoveUp, onMoveDown }) => {'
)

# 2. Add buttons inside SidebarCard actions
target_actions = '''        {!isPickingMode && (
          <div className="opacity-0 group-hover/side:opacity-100 flex gap-0.5 bg-slate-400/80 p-0.5 rounded-lg shadow mr-1 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} '''

repl_actions = '''        {!isPickingMode && (
          <div className="opacity-0 group-hover/side:opacity-100 flex gap-0.5 bg-slate-400/80 p-0.5 rounded-lg shadow mr-1 transition-opacity">
            <button 
              onClick={(e) => { if (onMoveUp) { e.stopPropagation(); onMoveUp(); } }} 
              className={cx("p-0.5 rounded text-white transition-colors", onMoveUp ? "hover:bg-slate-500/70" : "invisible")} 
              title={onMoveUp ? "上に移動" : ""}
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { if (onMoveDown) { e.stopPropagation(); onMoveDown(); } }} 
              className={cx("p-0.5 rounded text-white transition-colors", onMoveDown ? "hover:bg-slate-500/70" : "invisible")} 
              title={onMoveDown ? "下に移動" : ""}
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); openModal('emp', emp); }} '''

if target_actions in text:
    text = text.replace(target_actions, repl_actions)
else:
    print("Error: target_actions not found")

# 3. Update unassigned map
target_unassigned_map = '''           {nextMap.unassigned.map(emp => (
             <SidebarCard 
               key={emp.id} 
               emp={emp} 
               isRetired={false} 
               onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'unassigned', null, null, null); }} 
             />
           ))}'''

repl_unassigned_map = '''           {nextMap.unassigned.map((emp, i, arr) => (
             <SidebarCard 
               key={emp.id} 
               emp={emp} 
               isRetired={false} 
               onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'unassigned', null, null, null); }} 
               onMoveUp={i > 0 ? () => mutations.moveEmployee(emp.id, false, 'up') : null}
               onMoveDown={i < arr.length - 1 ? () => mutations.moveEmployee(emp.id, false, 'down') : null}
             />
           ))}'''

if target_unassigned_map in text:
    text = text.replace(target_unassigned_map, repl_unassigned_map)
else:
    print("Error: target_unassigned_map not found")

# 4. Update retired map
target_retired_map = '''          {nextMap.retired.map(emp => (
            <SidebarCard 
              key={emp.id} 
              emp={emp} 
              isRetired={true} 
              onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'retired', null, null, null); }} 
            />
          ))}'''

# Wait, let's double check the exact string for retired. 
repl_retired_map = '''          {nextMap.retired.map((emp, i, arr) => (
            <SidebarCard 
              key={emp.id} 
              emp={emp} 
              isRetired={true} 
              onClick={(e) => { e.stopPropagation(); handleCellClick(emp.id, false, 'retired', null, null, null); }} 
              onMoveUp={i > 0 ? () => mutations.moveEmployee(emp.id, false, 'up') : null}
              onMoveDown={i < arr.length - 1 ? () => mutations.moveEmployee(emp.id, false, 'down') : null}
            />
          ))}'''

if target_retired_map in text:
    text = text.replace(target_retired_map, repl_retired_map)
else:
    print("Error: target_retired_map not found")

with open('src/components/layout/AppSidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch complete")
