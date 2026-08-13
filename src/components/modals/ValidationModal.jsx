import React, { useEffect, useState } from 'react';
import { validateEmployees, autoFixEmployees } from '../../utils/validation.js';
import { AlertCircle, AlertTriangle, CheckCircle, Check, X } from 'lucide-react';

export const ValidationModal = ({ isOpen, onClose, employees, targetYear, onEmpClick, onAutoFix }) => {
  const [fixes, setFixes] = useState([]);
  const [hasAutoFixed, setHasAutoFixed] = useState(false);

  useEffect(() => {
    if (isOpen && !hasAutoFixed) {
      const { newEmps, fixes: newFixes } = autoFixEmployees(employees, targetYear);
      if (newFixes.length > 0) {
        setFixes(newFixes);
        if (onAutoFix) onAutoFix(newEmps);
      }
      setHasAutoFixed(true);
    } else if (!isOpen) {
      setHasAutoFixed(false);
      setFixes([]);
    }
  }, [isOpen, hasAutoFixed, employees, targetYear, onAutoFix]);

  if (!isOpen) return null;

  const warnings = validateEmployees(employees, targetYear);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-[800px] max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-400" />
            <div>
              <h2 className="text-lg font-bold">データ矛盾チェック結果</h2>
              <p className="text-xs text-slate-300">昇進年度や経過年数、役職設定に矛盾がある職員を検出しました</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {warnings.length === 0 && fixes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
              <CheckCircle className="w-16 h-16 mb-4 opacity-80" />
              <h3 className="text-xl font-bold">矛盾は見つかりませんでした</h3>
              <p className="text-sm mt-2 opacity-80">全ての職員データは正常に設定されています。</p>
            </div>
          ) : (
            <div className="space-y-4">
              {warnings.length > 0 && (
                <div className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-200 shadow-sm flex items-center justify-between">
                  <span>要修正 <strong>{warnings.length}</strong> 件の警告が見つかりました。職員名をクリックして個別に修正してください。</span>
                </div>
              )}
              {fixes.length > 0 && (
                <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded border border-blue-200 shadow-sm flex items-center justify-between">
                  <span><strong>{fixes.length}</strong> 件の項目を自動修正しました。</span>
                </div>
              )}
              
              <div className="space-y-3">
                {warnings.map((warn, i) => (
                  <div 
                    key={`warn-${i}`} 
                    onClick={() => onEmpClick && onEmpClick(warn.empId)}
                    className="flex gap-4 p-4 bg-white hover:bg-yellow-50/50 rounded-lg border-l-4 border-yellow-400 shadow-sm relative overflow-hidden group cursor-pointer transition-colors"
                    title="クリックして職員情報を編集"
                  >
                    <div className="shrink-0 pt-0.5">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-lg group-hover:text-[#0F828C] transition-colors">{warn.empName}</span>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                          {warn.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{warn.message}</p>
                    </div>
                  </div>
                ))}

                {fixes.map((fix, i) => (
                  <div 
                    key={`fix-${i}`} 
                    onClick={() => onEmpClick && onEmpClick(fix.empId)}
                    className="flex gap-4 p-4 bg-white hover:bg-blue-50/50 rounded-lg border-l-4 border-blue-400 shadow-sm relative overflow-hidden group cursor-pointer transition-colors"
                    title="クリックして職員情報を確認"
                  >
                    <div className="shrink-0 pt-0.5">
                      <Check className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-800 text-lg group-hover:text-[#0F828C] transition-colors">{fix.empName}</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                          修正済み
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">{fix.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
