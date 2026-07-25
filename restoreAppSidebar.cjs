const fs = require('fs');
const file = 'src/components/layout/AppSidebar.jsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const replacement = `    </div>
  );
};

export const AppSidebar = () => {
  const { nextMap, isPickingMode, handleCellClick } = useApp();
  return (
    <div className="w-full md:w-[260px] flex flex-col gap-2 shrink-0 h-full">
      <div 
        className={cx("bg-white rounded shadow-sm border border-slate-400 flex flex-col flex-1 border-t-4 border-amber-500 overflow-hidden transition-all", isPickingMode && "ring-2 ring-amber-400 ring-offset-1 cursor-pointer")}
        onClick={() => { if (isPickingMode) handleCellClick(null, false, 'unassigned', null, null, null); }}
        title={isPickingMode ? "選択中の職員を「未配置」にします" : ""}
      >
        <div className="bg-slate-100 p-2 border-b border-slate-400 font-bold text-xs flex justify-between items-center shrink-0 group/sideheader">
          <div className="flex items-center gap-1.5 text-slate-700">
            <AlertCircle className="w-4 h-4 text-amber-600" />未配置・保留
          </div>
          <CommentButton targetId="side-unassigned-header" tooltipPos="bottom-right" hoverClass="group-hover/sideheader:opacity-100" />
        </div>`;

// find line 73 which is `    </div>`
for(let i=65; i<85; i++) {
  if(lines[i] === '    </div>' && lines[i+1] === '          </div>') {
    lines.splice(i, 4, replacement);
    break;
  }
}

fs.writeFileSync(file, lines.join('\n'), 'utf8');
