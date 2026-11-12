import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, XCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DuplicateTabBlocker = ({ isPrimaryClosed, onClaim }) => {
  const [closeFailed, setCloseFailed] = useState(false);

  const handleClose = () => {
    window.close();
    // スクリプトで開かれていないタブなど、ブラウザによって window.close() が無視される場合の案内
    setTimeout(() => {
      setCloseFailed(true);
    }, 300);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* ヘッダー帯 */}
        <div className={`p-6 text-white flex items-center gap-4 ${isPrimaryClosed ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            {isPrimaryClosed ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : (
              <ShieldAlert className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {isPrimaryClosed ? 'アプリを開始できます' : '既に別のタブで開かれています'}
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              人事異動案作成アプリ - 多重起動防止
            </p>
          </div>
        </div>

        {/* コンテンツ本文 */}
        <div className="p-6 space-y-4">
          {isPrimaryClosed ? (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm leading-relaxed">
                <p className="font-semibold text-emerald-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline shrink-0" />
                  先に開いていたタブが閉じられました
                </p>
                このタブで安全にアプリを開始・編集できます。下のボタンを押してアプリを開いてください。
              </div>
              <button
                onClick={onClaim}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                このタブでアプリを開始する
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-slate-700 text-sm leading-relaxed space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  データの競合や上書きを防ぐための保護です
                </p>
                <p className="text-slate-600 text-xs">
                  本アプリはブラウザ内に作業データを保存しているため、複数のタブで同時に編集を行うと意図しないデータの上書きや破損が発生する恐れがあります。
                </p>
                <p className="text-slate-700 text-xs font-semibold pt-1">
                  先に開いているタブに移動して作業を続けるか、そちらのタブを閉じてからご利用ください。
                </p>
              </div>

              {closeFailed && (
                <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-xs text-slate-600">
                  ※ブラウザのセキュリティ制限により自動でタブを閉じられませんでした。ブラウザのタブ右上の「×」ボタンから閉じてください。
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReload}
                  className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-bold py-2.5 px-4 rounded-xl border border-slate-300 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  title="先行タブを閉じた後に再試行します"
                >
                  <RefreshCw className="w-4 h-4" />
                  再試行（再読み込み）
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-slate-800 hover:bg-slate-900 active:bg-black text-white font-bold py-2.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                  title="この重複したタブを閉じます"
                >
                  <XCircle className="w-4 h-4" />
                  このタブを閉じる
                </button>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-center">
          <span className="text-[11px] text-slate-400">
            先行タブを閉じると、この画面が自動的に再開可能な状態に切り替わります
          </span>
        </div>
      </div>
    </div>
  );
};
