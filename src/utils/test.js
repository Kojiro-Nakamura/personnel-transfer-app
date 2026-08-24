import fs from 'fs';
import { analyzeChainTransfers } from './chainTransferParser.js';
const data = JSON.parse(fs.readFileSync('../../public/data.json'));
const deps = data.departments;
const postOrderMap = {};
let order = 0;
deps.forEach(dept => {
  if (dept.type !== 'regular') return;
  dept.posts.forEach(post => {
    postOrderMap[\POST|\|\] = order;
    postOrderMap[\TITLE|\||\\] = order;
    order++;
  });
  dept.groups.forEach(group => {
    group.posts.forEach(post => {
      postOrderMap[\POST||\\] = order;
      postOrderMap[\TITLE|\|\|\\] = order;
      order++;
    });
  });
});
const movesData = analyzeChainTransfers(data.employees, data.departments, 2026);
let missing = 0;
movesData.moves.forEach(m => {
  if (postOrderMap[m.fromPostId] === undefined && m.fromPost.type !== 'unassigned' && m.fromPost.type !== 'retired') {
    console.log('Missing fromPostId:', m.fromPostId, m.fromPost.title);
    missing++;
  }
});
console.log('Total missing:', missing);
