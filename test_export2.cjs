const fs = require('fs');

async function test() {
   try {
       // Mock the browser environment briefly or just require it if it's node compatible
       // Wait, exportExcel.js imports ExcelJS and helper functions. We can try to load it.
       // However, this is an ES module (export const ...). We need dynamic import.
       const module = await import('./src/utils/exportExcel.js');
       console.log("Module loaded successfully");
       // We can't fully mock departments/employees easily without building a big dataset.
   } catch (err) {
       console.error("Error loading module:", err);
   }
}
test();
