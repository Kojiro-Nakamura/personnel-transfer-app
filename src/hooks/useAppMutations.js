import { useMemo, useCallback } from 'react';
import { calcNextSkills, calcOrder, clearPlacement } from '../utils/helpers.js';
export function useAppMutations(setEmployees, setDepartments, setNotes, commit) {
  const updateEmps = useCallback((updater) => { commit(); setEmployees(updater); }, [commit, setEmployees]);
  const updateDepts = useCallback((updater) => { commit(); setDepartments(updater); }, [commit, setDepartments]);
  const updateNotesState = useCallback((updater) => { commit(); setNotes(updater); }, [commit, setNotes]);

  return useMemo(() => ({
    addEmployee: (data) => updateEmps(prev => [...prev, { id: `emp-${Date.now()}`, orderCurrent: Date.now(), orderNext: Date.now(), ...data }]),
    updateEmployee: (id, data) => updateEmps(prev => prev.map(emp => emp.id === id ? { ...emp, ...data } : emp)),
    bulkProcessEmployees: (updates, deletes, additions) => updateEmps(prev => {
      let next = [...prev];
      if (deletes?.length) { 
        const delSet = new Set(deletes); 
        next = next.filter(e => !delSet.has(e.id)); 
      }
      if (updates?.length) { 
        const updMap = new Map(updates.map(e => [e.id, e])); 
        next = next.map(e => updMap.has(e.id) ? { ...e, ...updMap.get(e.id) } : e); 
      }
      if (additions?.length) {
        next = [...next, ...additions];
      }
      return next;
    }),
    unassignEmployee: (id, isSource) => updateEmps(prev => prev.map(emp => { 
      if (emp.id !== id) return emp; 
      if (isSource) {
        return { ...emp, currentDeptId: 'unassigned', currentPostId: null, currentGroupId: null, currentGroupPostId: null }; 
      }
      return { ...emp, departmentId: 'unassigned', postId: null, groupId: null, groupPostId: null }; 
    })),
    assignSlot: (empId, placement) => updateEmps(prev => {
      const idx = prev.findIndex(e => e.id === empId);
      if (idx === -1) return prev;
      
      const nE = { ...prev[idx] };
      const { dId, pId, gId, gpId } = placement;
      
      nE.departmentId = dId; 
      nE.postId = pId; 
      nE.groupId = gId; 
      nE.groupPostId = gpId;
      
      const isSameDepartment = dId !== 'unassigned' && dId !== 'retired' && dId === nE.currentDeptId;
      const isSamePost = pId && nE.currentPostId === pId;
      const isSameGroupGeneral = gId && !gpId && nE.currentGroupId === gId && !nE.currentGroupPostId;
      const isSameGroupPost = gId && gpId && nE.currentGroupId === gId && nE.currentGroupPostId === gpId;
      const isSameDeptGeneral = !pId && !gId && !nE.currentPostId && !nE.currentGroupId;

      const isSameSlot = isSameDepartment && (isSamePost || isSameGroupGeneral || isSameGroupPost || isSameDeptGeneral);
      
      nE.nextYears = isSameSlot ? (nE.currentYears || 0) + 1 : 1; 
      nE.nextSkills = (dId === 'unassigned' || dId === 'retired') ? [] : calcNextSkills(nE.currentSkills, nE.currentYears, isSameSlot, isSameDepartment);
      
      const sg = prev.filter(e => 
        e.id !== empId && 
        (e.departmentId === dId && e.postId === pId && e.groupId === gId && e.groupPostId === gpId)
      ).sort((a, b) => (a.orderNext || 0) - (b.orderNext || 0));
      
      nE.orderNext = calcOrder(sg, -1, 'after', 'orderNext');
      
      const res = [...prev]; 
      res[idx] = nE; 
      return res;
    }),
    
    addDepartment: (data) => updateDepts(prev => [...prev, { id: `dept-${Date.now()}`, type: 'regular', posts: [], groups: [], ...data }]),
    updateDepartment: (id, data) => updateDepts(prev => prev.map(dept => dept.id === id ? { ...dept, ...data } : dept)),
    updateAllDepartments: (depts) => updateDepts(depts),
    deleteDepartment: (id) => { 
      updateDepts(prev => prev.filter(d => d.id !== id)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, id, 'dept'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`dept-${id}`))); 
    },
    addPost: (dId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: [...(d.posts || []), { id: `post-${Date.now()}`, ...data }] } : d)),
    updatePost: (dId, pId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: d.posts.map(p => p.id === pId ? { ...p, ...data } : p) } : d)),
    deletePost: (dId, pId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, posts: d.posts.filter(p => p.id !== pId) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, pId, 'post'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`post-${pId}`))); 
    },
    addGroup: (dId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: [...(d.groups || []), { id: `grp-${Date.now()}`, posts: [], ...data }] } : d)),
    updateGroup: (dId, gId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, ...data } : g) } : d)),
    deleteGroup: (dId, gId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.filter(g => g.id !== gId) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, gId, 'group'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`group-${gId}`))); 
    },
    addGroupPost: (dId, gId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: [...(g.posts || []), { id: `gpost-${Date.now()}`, ...data }] } : g) } : d)),
    updateGroupPost: (dId, gId, pId, data) => updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: g.posts.map(p => p.id === pId ? { ...p, ...data } : p) } : g) } : d)),
    deleteGroupPost: (dId, gId, pId) => { 
      updateDepts(prev => prev.map(d => d.id === dId ? { ...d, groups: d.groups.map(g => g.id === gId ? { ...g, posts: g.posts.filter(p => p.id !== pId) } : g) } : d)); 
      updateEmps(prev => prev.map(e => clearPlacement(e, pId, 'groupPost'))); 
      updateNotesState(prev => prev.filter(n => !n.targetId.includes(`groupPost-${pId}`))); 
    },
    
    moveDepartment: (dId, dir) => updateDepts(prev => { 
      const idx = prev.findIndex(d => d.id === dId); 
      const min = prev.findIndex(d => d.type === 'regular'); 
      if (idx < 0 || (dir === 'up' && idx <= min) || (dir === 'down' && idx === prev.length - 1)) return prev; 
      const n = [...prev]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return n; 
    }),
    movePost: (dId, pId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const idx = d.posts.findIndex(pt => pt.id === pId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === d.posts.length - 1)) return d; 
      const n = [...d.posts]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return { ...d, posts: n }; 
    })),
    moveGroupPost: (dId, gId, pId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const ng = d.groups.map(g => { 
        if (g.id !== gId) return g; 
        const idx = g.posts.findIndex(pt => pt.id === pId); 
        if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === g.posts.length - 1)) return g; 
        const n = [...g.posts]; 
        const s = dir === 'up' ? idx - 1 : idx + 1; 
        [n[idx], n[s]] = [n[s], n[idx]]; 
        return { ...g, posts: n }; 
      }); 
      return { ...d, groups: ng }; 
    })),
    moveGroup: (dId, gId, dir) => updateDepts(prev => prev.map(d => { 
      if (d.id !== dId) return d; 
      const idx = d.groups.findIndex(g => g.id === gId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === d.groups.length - 1)) return d; 
      const n = [...d.groups]; 
      const s = dir === 'up' ? idx - 1 : idx + 1; 
      [n[idx], n[s]] = [n[s], n[idx]]; 
      return { ...d, groups: n }; 
    })),
    moveEmployee: (eId, src, dir) => updateEmps(prev => {
      const emp = prev.find(e => e.id === eId); 
      if (!emp) return prev;
      
      const k = src ? 'orderCurrent' : 'orderNext';
      const sg = prev.filter(e => {
        if (src) {
          if (emp.currentDeptId === 'unassigned' || emp.currentDeptId === 'retired') return e.currentDeptId === emp.currentDeptId;
          return e.currentDeptId === emp.currentDeptId && (e.currentPostId||null) === (emp.currentPostId||null) && (e.currentGroupId||null) === (emp.currentGroupId||null) && (e.currentGroupPostId||null) === (emp.currentGroupPostId||null);
        } else {
          if (emp.departmentId === 'unassigned' || emp.departmentId === 'retired') return e.departmentId === emp.departmentId;
          return e.departmentId === emp.departmentId && (e.postId||null) === (emp.postId||null) && (e.groupId||null) === (emp.groupId||null) && (e.groupPostId||null) === (emp.groupPostId||null);
        }
      }).sort((a, b) => (a[k] || 0) - (b[k] || 0));
      
      const idx = sg.findIndex(e => e.id === eId); 
      if (idx < 0 || (dir === 'up' && idx === 0) || (dir === 'down' && idx === sg.length - 1)) return prev;
      
      const newSg = [...sg];
      const s = dir === 'up' ? idx - 1 : idx + 1;
      [newSg[idx], newSg[s]] = [newSg[s], newSg[idx]];
      
      return prev.map(e => {
        const foundIdx = newSg.findIndex(x => x.id === e.id);
        if (foundIdx !== -1) {
          return { ...e, [k]: (foundIdx + 1) * 1000 };
        }
        return e;
      });
    }),
    setNote: (targetId, text) => updateNotesState(prev => {
      const exists = prev.find(n => n.targetId === targetId);
      if (!text.trim()) return prev.filter(n => n.targetId !== targetId);
      if (exists) return prev.map(n => n.targetId === targetId ? { ...n, text } : n);
      return [...prev, { id: `note-${Date.now()}`, targetId, text }];
    }),
  }), [updateEmps, updateDepts, updateNotesState]);
}
