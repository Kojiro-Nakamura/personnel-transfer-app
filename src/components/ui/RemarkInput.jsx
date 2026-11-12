import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { REMARK_CANDIDATES } from '../../constants/config.js';
import { getRemarkBgClass, cx } from '../../utils/helpers.js';

/**
 * 職員カード（編集モーダル）用 備考入力コンポーネント
 * テキスト自由入力 + datalist補完 + 明示的な候補ドロップダウン選択
 */
export const RemarkInput = ({
  label = "備考",
  value = "",
  onChange,
  disabled = false,
  placeholder = "新採No.1、育代No.1など",
  listId = "remark-options-list",
  className = "",
  inputClassName = "",
  candidates = REMARK_CANDIDATES
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // 外側クリックでドロップダウンを閉じる
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (candidate) => {
    onChange(candidate);
    setIsOpen(false);
    // 入力欄にフォーカスを当てて末尾にカーソルを移動
    if (inputRef.current) {
      inputRef.current.focus();
      const len = candidate.length;
      inputRef.current.setSelectionRange(len, len);
    }
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cx("relative", className)} ref={containerRef}>
      <div className="flex items-center justify-between mb-0.5">
        <label className={cx("block text-[11px]", disabled ? "text-slate-400" : "text-slate-600 font-medium")}>
          {label}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-[10px] text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-300 rounded px-1.5 py-0.2 flex items-center gap-0.5 transition cursor-pointer"
            title="備考の候補リストを表示"
          >
            <span>候補から選択</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          list={listId}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cx(
            "w-full h-[28px] border rounded px-1.5 pr-6 py-1 text-xs outline-none focus:ring-1 focus:ring-[#0F828C]",
            disabled ? "bg-slate-100 text-slate-500" : (inputClassName || "bg-white"),
            placeholder ? "placeholder:text-slate-400" : ""
          )}
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            tabIndex={-1}
            className="absolute right-1 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            title="候補一覧を開く"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* datalist (ブラウザ標準補完) */}
      <datalist id={listId}>
        {candidates.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-xl z-50 py-1 max-h-56 overflow-y-auto text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] text-slate-400 font-bold border-b border-slate-100 flex justify-between items-center">
            <span>備考の候補</span>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-rose-600 hover:text-rose-800 flex items-center gap-0.5 text-[10px] cursor-pointer"
              >
                <X className="w-2.5 h-2.5" /> クリア
              </button>
            )}
          </div>
          {candidates.map((cand) => {
            const bgClass = getRemarkBgClass(cand);
            return (
              <button
                key={cand}
                type="button"
                onClick={() => handleSelect(cand)}
                className="w-full text-left px-2.5 py-1.5 hover:bg-teal-50 flex items-center justify-between transition cursor-pointer text-slate-700"
              >
                <span className="font-medium">{cand}</span>
                {bgClass && (
                  <span className={cx("text-[10px] px-1.5 py-0.5 rounded border border-black/10 font-bold", bgClass)}>
                    色見本
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * 職員一括編集（テーブルセル）用 備考入力コンポーネント
 */
export const RemarkCellInput = ({
  value = "",
  onChange,
  placeholder = "新採No.1など",
  className = "",
  listId = "remark-list-bulk",
  candidates = REMARK_CANDIDATES
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const cellRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (cellRef.current && !cellRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const handleSelect = (candidate) => {
    onChange(candidate);
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
      const len = candidate.length;
      inputRef.current.setSelectionRange(len, len);
    }
  };

  const bgClass = getRemarkBgClass(value);

  return (
    <div className="relative w-full h-full flex items-center" ref={cellRef}>
      <input
        ref={inputRef}
        type="text"
        list={listId}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(className, "w-full pr-4", bgClass)}
      />
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={-1}
        className="absolute right-0.5 text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
        title="候補一覧から選択"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-48 mt-0.5 bg-white border border-slate-300 rounded shadow-xl z-[120] py-1 max-h-52 overflow-y-auto text-xs">
          <div className="px-2 py-0.5 text-[10px] text-slate-400 font-bold border-b border-slate-100 flex justify-between items-center">
            <span>備考候補</span>
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setIsOpen(false); }}
                className="text-rose-500 hover:text-rose-700 text-[10px] cursor-pointer"
              >
                クリア
              </button>
            )}
          </div>
          {candidates.map((cand) => {
            const itemBg = getRemarkBgClass(cand);
            return (
              <button
                key={cand}
                type="button"
                onClick={() => handleSelect(cand)}
                className="w-full text-left px-2 py-1 hover:bg-teal-50 flex items-center justify-between text-slate-700 cursor-pointer"
              >
                <span>{cand}</span>
                {itemBg && <span className={cx("w-3 h-3 rounded-full border border-black/10 inline-block", itemBg)} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
