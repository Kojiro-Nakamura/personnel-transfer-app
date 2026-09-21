import React from 'react';
import { X, Check } from 'lucide-react';
import { cx } from '../../utils/helpers.js';

export const PartialImportConfirmModal = ({ isOpen, onClose, onConfirm, updates = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[200] p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl shadow-xl border-t-4 border-[#0F828C] flex flex-col max-h-[90vh]">
        <h3 className="text-xl font-bold text-[#320A6B] mb-4 flex items-center gap-2">
          一部インポートの確認
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          以下の職員のデータ（特記事項、配属希望、特殊事情）が上書きされます。内容を確認し、「上書きを実行」をクリックしてください。
          （変更がない職員は表示されていません）
        </p>

        <div className="flex-1 overflow-auto border border-slate-200 rounded">
          <table className="w-full text-sm text-left border-collapse min-w-max">
            <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 border-b border-r font-bold">職員番号</th>
                <th className="py-2 px-3 border-b border-r font-bold">氏名</th>
                <th className="py-2 px-3 border-b border-r font-bold">項目</th>
                <th className="py-2 px-3 border-b border-r font-bold">変更前</th>
                <th className="py-2 px-3 border-b font-bold bg-orange-50 text-orange-900">変更後</th>
              </tr>
            </thead>
            <tbody>
              {updates.map((update, i) => {
                const diffs = [];
                if (update.old.note !== update.new.note) diffs.push({ label: '特記事項', old: update.old.note, new: update.new.note });
                if (update.old.desiredAssignment !== update.new.desiredAssignment) diffs.push({ label: '配属希望', old: update.old.desiredAssignment, new: update.new.desiredAssignment });
                if (update.old.specialCircumstances !== update.new.specialCircumstances) diffs.push({ label: '特殊事情', old: update.old.specialCircumstances, new: update.new.specialCircumstances });

                return diffs.map((diff, dIndex) => (
                  <tr key={`${update.id}-${diff.label}`} className={cx("hover:bg-slate-50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-slate-50/50")}>
                    {dIndex === 0 && (
                      <>
                        <td className="py-2 px-3 border-b border-r text-slate-600" rowSpan={diffs.length}>{update.employeeNumber}</td>
                        <td className="py-2 px-3 border-b border-r font-bold text-slate-800" rowSpan={diffs.length}>{update.name}</td>
                      </>
                    )}
                    <td className="py-2 px-3 border-b border-r whitespace-nowrap text-slate-700">{diff.label}</td>
                    <td className="py-2 px-3 border-b border-r text-slate-500 whitespace-pre-wrap min-w-[200px]">{diff.old || <span className="text-slate-300 italic">(なし)</span>}</td>
                    <td className="py-2 px-3 border-b bg-orange-50/50 text-slate-900 whitespace-pre-wrap min-w-[200px]">{diff.new || <span className="text-slate-300 italic">(なし)</span>}</td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={() => onConfirm(updates)} 
            className="px-6 py-2 rounded font-bold text-white bg-[#0F828C] hover:bg-teal-600 transition-colors flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            上書きを実行 ({updates.length}件)
          </button>
        </div>
      </div>
    </div>
  );
};