import fs from "fs";
import { parse } from "acorn";

const code = fs.readFileSync("src/utils/exportExcel.js", "utf8");

// Parse only the addCurrentBasePlanSheet function body to find undefined references
const ast = parse(code, { ecmaVersion: 2022, sourceType: "module" });

let targetFunc = null;
for (const node of ast.body) {
    if (node.type === "ExportNamedDeclaration" && node.declaration && node.declaration.declarations) {
        for (const decl of node.declaration.declarations) {
            if (decl.id.name === "addCurrentBasePlanSheet") {
                targetFunc = decl;
            }
        }
    }
}

if (!targetFunc) {
    console.log("NOT FOUND");
    process.exit(1);
}

// Very basic scope checking is hard, but we can just check if any identifier is obvious.
console.log("Function found, size:", JSON.stringify(targetFunc).length);