import { isGroupVisible, getGradeLevel } from './src/utils/helpers.js';

const group = { id: 'g1', name: '計画推進班' };
const groupData = {
  direct: {
    current: [
      { currentGrade: '一般', nextGrade: '課長補佐' },
      { currentGrade: '主任', nextGrade: '主任' }
    ],
    next: []
  },
  posts: {}
};

console.log('Filter Level = 8');
console.log('isGroupVisible:', isGroupVisible(group, groupData, 8));
