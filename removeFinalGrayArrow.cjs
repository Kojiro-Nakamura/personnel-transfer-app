const fs = require('fs');
const file = 'src/components/employee/EmployeeComponents.jsx';
let content = fs.readFileSync(file, 'utf8');

const oldElse = `    } else {
      // Empty gray arrow
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <ChevronRight className="w-4 h-4 text-slate-300 mb-1" />
        </div>
      );
    }`;

const newElse = `    } else {
      // Empty gray arrow
      if (currentKey === 'finalArrow') {
        return <div className="flex flex-col items-center justify-end h-full pb-1"></div>;
      }
      return (
        <div className="flex flex-col items-center justify-end h-full pb-1">
          <ChevronRight className="w-4 h-4 text-slate-300 mb-1" />
        </div>
      );
    }`;

content = content.replace(oldElse, newElse);
fs.writeFileSync(file, content, 'utf8');
