import React, { useState, useMemo, useEffect, useCallback, useRef, useId } from 'react';
import { X, TrendingUp, Download, Play, Pause, RotateCcw, Printer, ExternalLink } from 'lucide-react';
import { NewWindowPortal } from '../common/NewWindowPortal.jsx';
import {
  extractSimBaseline,
  runRecruitmentSimulation,
  formatSimEraYear,
  exportSimulationCsv
} from '../../utils/recruitmentSimulator.js';

// CUD (Okabe-Ito) 色覚多様性配慮パレット（ライト・印刷背景用）
const CUD = {
  blue: '#0072B2',
  navy: '#005A9C',
  sky: '#56B4E9',
  skyLight: '#BAE6FD',
  vermilion: '#D55E00',
  vermilionStripe: '#FFAD75',
  vermilionText: '#C2410C',
  yellow: '#F0C808',
  yellowStroke: '#8A6500',
  yellowText: '#926000',
  blueText: '#0066A6',
  refLine: '#0F172A',
  refHalo: '#FFFFFF'
};

const HALO_CARD_STYLE = {
  paintOrder: 'stroke fill',
  stroke: '#FFFFFF',
  strokeWidth: '3px',
  strokeLinejoin: 'round'
};

const HALO_DARK_STYLE = {
  paintOrder: 'stroke fill',
  stroke: '#003359',
  strokeWidth: '2.2px',
  strokeLinejoin: 'round'
};

const HALO_LIGHT_STYLE = {
  paintOrder: 'stroke fill',
  stroke: '#FFFFFF',
  strokeWidth: '2.6px',
  strokeLinejoin: 'round'
};

function fmtCompactInt(v) {
  if (v < 0.05) return '0';
  return String(Math.round(v));
}

/**
 * ブラウザ印刷設定で「背景のグラフィック」がOFFでも確実に色・斜線が出力されるベクターSVG凡例スウォッチ
 */
const SvgSwatch = ({ variant }) => {
  const rawId = useId().replace(/:/g, '');
  const patId = `sw-${variant}-${rawId}`;

  if (variant === 'vermilionStripe') {
    return (
      <svg width="13" height="13" viewBox="0 0 14 14" className="inline-block shrink-0 align-middle">
        <defs>
          <pattern id={patId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" fill={CUD.vermilion} />
            <line x1="0" y1="0" x2="0" y2="5" stroke={CUD.vermilionStripe} strokeWidth="2" />
          </pattern>
        </defs>
        <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill={`url(#${patId})`} stroke="#9A3412" strokeWidth="1" />
      </svg>
    );
  }

  if (variant === 'skyStripe') {
    return (
      <svg width="13" height="13" viewBox="0 0 14 14" className="inline-block shrink-0 align-middle">
        <defs>
          <pattern id={patId} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="5" height="5" fill={CUD.sky} />
            <line x1="0" y1="0" x2="0" y2="5" stroke={CUD.skyLight} strokeWidth="2" />
          </pattern>
        </defs>
        <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill={`url(#${patId})`} stroke="#0284C7" strokeWidth="1" />
      </svg>
    );
  }

  const map = {
    yellow: { fill: CUD.yellow, stroke: CUD.yellowStroke },
    blue: { fill: CUD.blue, stroke: CUD.blue },
    navy: { fill: CUD.navy, stroke: CUD.navy },
    sky: { fill: CUD.sky, stroke: '#0284C7' }
  };
  const cfg = map[variant] || map.blue;

  return (
    <svg width="13" height="13" viewBox="0 0 14 14" className="inline-block shrink-0 align-middle">
      <rect x="0.5" y="0.5" width="13" height="13" rx="2" fill={cfg.fill} stroke={cfg.stroke} strokeWidth="1" />
    </svg>
  );
};

export const RecruitmentSimulatorModal = ({
  isOpen,
  onClose,
  employees,
  departments,
  targetYear,
  planName = '基本案',
  activePlanId = '',
  currentFileName = '',
  targetWindow = null
}) => {
  const rootRef = useRef(null);
  const [manualWindow, setManualWindow] = useState(null);
  const [portalBlocked, setPortalBlocked] = useState(false);

  const [baseMode, setBaseMode] = useState('next'); // 'next' | 'current'
  const [activeTab, setActiveTab] = useState('trend'); // 'trend' | 'posts' | 'pyramid' | 'table'
  const [selectedHorizon, setSelectedHorizon] = useState(15);
  const [strategy, setStrategy] = useState('level'); // 'level' | 'replace'
  const [tempMode, setTempMode] = useState('replace_temp'); // 'replace_temp' | 'keep_temp'
  const [age60DropPct, setAge60DropPct] = useState(10);
  const [midAttritionPct, setMidAttritionPct] = useState(0.5);

  const base = useMemo(
    () => extractSimBaseline({ employees, departments, targetYear, baseMode }),
    [employees, departments, targetYear, baseMode]
  );

  const [startHeadcount, setStartHeadcount] = useState(() => Math.max(1, base.totalPlacedCount || 1));
  const [goalYears, setGoalYears] = useState(10);
  const [goalHeadcount, setGoalHeadcount] = useState(() => Math.max(1, base.totalPlacedCount || 1));
  const [baseAnnualHire, setBaseAnnualHire] = useState(5);
  const [postGoalAnnualHire, setPostGoalAnnualHire] = useState(5);
  const [customHiresByYear, setCustomHiresByYear] = useState({});

  const [pyramidIdx, setPyramidIdx] = useState(0);
  const [pyramidViewMode, setPyramidViewMode] = useState('single'); // 'single' | 'compare3'
  const [isPlaying, setIsPlaying] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // 印刷向けオプション（A4縦・上下2段配置・綴じ代余白設定）
  const [printScope, setPrintScope] = useState('all'); // 'all' | 'current'
  const [bindingMode, setBindingMode] = useState('left'); // 'left' (左綴じ22mm) | 'duplex' (両面長辺綴じ内側22mm) | 'top' (上綴じ24mm)
  const [showNamesInTable, setShowNamesInTable] = useState(false);
  const [printIncludeNames, setPrintIncludeNames] = useState(true);

  const activeWinProp = manualWindow && !manualWindow.closed ? manualWindow : targetWindow;

  useEffect(() => {
    if (activeWinProp && !activeWinProp.closed) {
      setPortalBlocked(false);
    }
  }, [activeWinProp]);

  // 起動時・案切替時・基準時点変更時に現在の案の人数と推奨採用数を初期反映
  const resetToCurrentPlan = useCallback((nextBase) => {
    const cnt = Math.max(1, nextBase.totalPlacedCount || 1);
    setStartHeadcount(cnt);
    setGoalHeadcount(cnt);
    setCustomHiresByYear({});
    const initSim = runRecruitmentSimulation({
      base: nextBase,
      startHeadcount: cnt,
      goalYears: 10,
      goalHeadcount: cnt,
      selectedHorizon: 15,
      strategy: 'level',
      tempMode: 'replace_temp',
      baseAnnualHire: 5,
      postGoalAnnualHire: 5,
      age60DropPct: 10,
      midAttritionPct: 0.5,
      customHiresByYear: {}
    });
    setBaseAnnualHire(Math.min(35, Math.max(0, Math.round(initSim.recommendedAnnualHire))));
    setPostGoalAnnualHire(Math.min(35, Math.max(0, Math.round(initSim.postGoalRecommendedHire))));
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetToCurrentPlan(base);
      setPyramidIdx(0);
      setIsPlaying(false);
    }
  }, [isOpen, baseMode, activePlanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const sim = useMemo(
    () =>
      runRecruitmentSimulation({
        base,
        startHeadcount,
        goalYears,
        goalHeadcount,
        selectedHorizon,
        strategy,
        tempMode,
        baseAnnualHire,
        postGoalAnnualHire,
        age60DropPct,
        midAttritionPct,
        customHiresByYear
      }),
    [
      base,
      startHeadcount,
      goalYears,
      goalHeadcount,
      selectedHorizon,
      strategy,
      tempMode,
      baseAnnualHire,
      postGoalAnnualHire,
      age60DropPct,
      midAttritionPct,
      customHiresByYear
    ]
  );

  // ピラミッド自動再生タイマー
  useEffect(() => {
    if (!isPlaying) return undefined;
    const id = setInterval(() => {
      setPyramidIdx(prev => (prev + 1 > sim.horizon ? 0 : prev + 1));
    }, 650);
    return () => clearInterval(id);
  }, [isPlaying, sim.horizon]);

  // 表示中のウィンドウ側のEscキーでのみ閉じる（親ウィンドウでの作業中のEsc誤閉鎖を防止）
  useEffect(() => {
    if (!isOpen) return undefined;
    const win = rootRef.current?.ownerDocument?.defaultView || window;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    win.addEventListener('keydown', onKey);
    return () => win.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, portalBlocked]);

  const handleApplyRecommended = () => {
    setCustomHiresByYear({});
    setBaseAnnualHire(Math.min(35, Math.max(0, Math.round(sim.recommendedAnnualHire))));
    setPostGoalAnnualHire(Math.min(35, Math.max(0, Math.round(sim.postGoalRecommendedHire))));
  };

  const handleResetToActual = () => {
    const cnt = Math.max(1, base.totalPlacedCount || 1);
    setStartHeadcount(cnt);
    setGoalHeadcount(cnt);
    setCustomHiresByYear({});
    const nextSim = runRecruitmentSimulation({
      base,
      startHeadcount: cnt,
      goalYears,
      goalHeadcount: cnt,
      selectedHorizon,
      strategy,
      tempMode,
      baseAnnualHire,
      postGoalAnnualHire,
      age60DropPct,
      midAttritionPct,
      customHiresByYear: {}
    });
    setBaseAnnualHire(Math.min(35, Math.max(0, Math.round(nextSim.recommendedAnnualHire))));
    setPostGoalAnnualHire(Math.min(35, Math.max(0, Math.round(nextSim.postGoalRecommendedHire))));
  };

  const handlePrint = (e) => {
    setIsPlaying(false);
    setTooltip(null);
    const win = e?.currentTarget?.ownerDocument?.defaultView || rootRef.current?.ownerDocument?.defaultView || window;
    win.focus();
    setTimeout(() => {
      win.print();
    }, 60);
  };

  const handlePopOutManually = () => {
    const win = window.open('', '_blank', 'width=1440,height=920,left=60,top=40');
    if (win) {
      setManualWindow(win);
      setPortalBlocked(false);
    } else {
      alert('ポップアップがブロックされました。ブラウザのアドレスバー右端からポップアップを許可してください。');
    }
  };

  const handleFullClose = () => {
    if (manualWindow && !manualWindow.closed) {
      manualWindow.close();
    }
    setManualWindow(null);
    onClose();
  };

  const showFloatingTip = (e, content) => {
    const win = e?.currentTarget?.ownerDocument?.defaultView || window;
    const pad = 14;
    const maxW = 340;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + maxW > win.innerWidth - 12) x = e.clientX - maxW - pad;
    if (y + 180 > win.innerHeight - 12) y = Math.max(12, e.clientY - 170);
    setTooltip({ x: Math.max(12, x), y: Math.max(12, y), content });
  };

  const hideFloatingTip = () => setTooltip(null);

  if (!isOpen) return null;

  const isLevel = strategy === 'level';
  const isReplaceTemp = sim.tempMode === 'replace_temp';
  const futureYears = sim.yearly.slice(1);
  const sumRetire = futureYears.reduce((s, r) => s + r.retire65Count, 0);
  const maxRetireRow = futureYears.reduce(
    (m, r) => (r.retire65Count > m.retire65Count ? r : m),
    futureYears[0] || { year: base.baseYear + 1, retire65Count: 0 }
  );
  const sumYakushoku = futureYears.reduce((s, r) => s + r.yakushoku60Count, 0);
  const goalYearNum = base.baseYear + sim.goalYears;
  const totalDelta = sim.goalHeadcount - sim.startHeadcount;
  const perYrDelta = (Math.abs(totalDelta) / sim.goalYears).toFixed(1);
  const lowH = Math.floor(sim.recommendedAnnualHire);
  const highH = Math.ceil(sim.recommendedAnnualHire);
  const hasCustomHires = Object.keys(customHiresByYear).length > 0;

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  })();

  const windowTitle = `採用計画シミュレーター_${formatSimEraYear(targetYear)}_${planName}`;

  const pageMarginCss =
    bindingMode === 'duplex'
      ? `
        @page {
          size: A4 portrait;
          margin: 10mm 10mm 10mm 22mm;
        }
        @page :right {
          margin: 10mm 10mm 10mm 22mm;
        }
        @page :left {
          margin: 10mm 22mm 10mm 10mm;
        }
      `
      : bindingMode === 'top'
        ? `
        @page {
          size: A4 portrait;
          margin: 24mm 12mm 10mm 12mm;
        }
      `
        : `
        @page {
          size: A4 portrait;
          margin: 10mm 10mm 10mm 22mm;
        }
      `;

  // ====== KPI Cards Renderer ======
  const renderKpiCards = (isPrint = false) => (
    <div className={isPrint ? 'grid grid-cols-2 gap-2 mb-2.5 sim-avoid-break' : 'grid grid-cols-2 lg:grid-cols-4 gap-3'}>
      <div className={isPrint ? 'bg-white border border-slate-300 rounded-md px-2.5 py-1.5' : 'bg-white border border-slate-300 rounded-xl p-3.5 shadow-sm'}>
        <div className={isPrint ? 'text-[10px] text-slate-600 leading-tight' : 'text-xs text-slate-500'}>
          {formatSimEraYear(base.baseYear)} 正規在籍人員（臨任・育代含）
        </div>
        <div className={isPrint ? 'text-sm font-bold font-mono tabular-nums text-slate-900 leading-snug' : 'text-xl font-bold font-mono tabular-nums mt-0.5 text-slate-900'}>
          {base.totalPlacedCount}名
          <span className={isPrint ? 'ml-2 text-[9.5px] font-sans font-normal text-slate-600' : 'block text-xs font-sans font-normal text-slate-500 mt-0.5'}>
            実正規(育代{base.ikudaiCount}含) {base.nonTempCount}名＋臨任{base.tempCount}名 ※他除外{base.excludedCount}名除く
          </span>
        </div>
      </div>

      <div className={isPrint ? 'bg-white border border-slate-300 rounded-md px-2.5 py-1.5' : 'bg-white border border-slate-300 rounded-xl p-3.5 shadow-sm'}>
        <div className={isPrint ? 'text-[10px] text-slate-600 leading-tight' : 'text-xs text-slate-500'}>
          今後{sim.horizon}年間の65歳定年退職等
        </div>
        <div
          className={isPrint ? 'text-sm font-bold font-mono tabular-nums leading-snug' : 'text-xl font-bold font-mono tabular-nums mt-0.5'}
          style={{ color: CUD.vermilionText }}
        >
          計 {sumRetire}名
          <span className={isPrint ? 'ml-2 text-[9.5px] font-sans font-normal text-slate-600' : 'block text-xs font-sans font-normal text-slate-500 mt-0.5'}>
            年平均 {(sumRetire / sim.horizon).toFixed(1)}名（最大 {formatSimEraYear(maxRetireRow.year)} {maxRetireRow.retire65Count}名）
          </span>
        </div>
      </div>

      <div className={isPrint ? 'bg-white border border-slate-300 rounded-md px-2.5 py-1.5' : 'bg-white border border-slate-300 rounded-xl p-3.5 shadow-sm'}>
        <div className={isPrint ? 'text-[10px] text-slate-600 leading-tight' : 'text-xs text-slate-500'}>
          今後{sim.horizon}年間の60歳役職定年
        </div>
        <div
          className={isPrint ? 'text-sm font-bold font-mono tabular-nums leading-snug' : 'text-xl font-bold font-mono tabular-nums mt-0.5'}
          style={{ color: CUD.yellowText }}
        >
          計 {sumYakushoku}名
          <span className={isPrint ? 'ml-2 text-[9.5px] font-sans font-normal text-slate-600' : 'block text-xs font-sans font-normal text-slate-500 mt-0.5'}>
            年平均 {(sumYakushoku / sim.horizon).toFixed(1)}名が役職ポストから離脱
          </span>
        </div>
      </div>

      <div className={isPrint ? 'bg-white border border-slate-300 rounded-md px-2.5 py-1.5' : 'bg-white border border-slate-300 rounded-xl p-3.5 shadow-sm'}>
        <div className={isPrint ? 'text-[10px] text-slate-600 leading-tight' : 'text-xs text-slate-500'}>
          {sim.goalYears}年後(R{goalYearNum - 2018}) {sim.goalHeadcount}名達成の理論平準化採用数
        </div>
        <div
          className={isPrint ? 'text-sm font-bold font-mono tabular-nums leading-snug' : 'text-xl font-bold font-mono tabular-nums mt-0.5'}
          style={{ color: CUD.blueText }}
        >
          {sim.recommendedAnnualHire.toFixed(1)}名/年
          <span className={isPrint ? 'ml-2 text-[9.5px] font-sans font-normal text-slate-600' : 'block text-xs font-sans font-normal text-slate-500 mt-0.5'}>
            目安: {lowH === highH ? lowH : `${lowH}〜${highH}`}名/年
            {sim.horizon > sim.goalYears
              ? ` ／ 到達後維持: 約${sim.postGoalRecommendedHire.toFixed(1)}名/年`
              : isReplaceTemp && base.tempCount > 0
                ? `（現臨任${base.tempCount}名の正職員化含）`
                : ''}
          </span>
        </div>
      </div>
    </div>
  );

  // ====== Tab 1: Bar (Upper) & Line (Lower) Chart ======
  const renderTrendSection = (idSuffix = 'main', isPrint = false) => {
    const rows = futureYears;
    const W = isPrint ? Math.max(668, rows.length * 36 + 60) : Math.max(760, rows.length * 60 + 74);
    const H = isPrint ? 222 : 246;
    const padL = isPrint ? 36 : 44;
    const padR = isPrint ? 14 : 20;
    const padT = isPrint ? 25 : 28;
    const padB = isPrint ? 29 : 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const maxVal = Math.max(10, ...rows.map(r => Math.max(r.retire65Count, r.yakushoku60Count, r.hires))) + 2;
    const stepW = plotW / Math.max(1, rows.length);
    const barW = isPrint
      ? Math.min(12.5, Math.max(7.2, (stepW - 7) / 3))
      : Math.min(15, Math.max(10.5, (stepW - 14) / 3));
    const barGap = barW * 1.12;
    const barNumFont = isPrint && stepW < 34 ? '8.8' : isPrint ? '9.6' : '10.5';
    const barPatId = `sim-bar-verm-${idSuffix}`;

    const allRows = sim.yearly;
    const LW = isPrint ? Math.max(668, allRows.length * 34 + 68) : Math.max(760, allRows.length * 52 + 86);
    const LH = isPrint ? 254 : 282;
    const lPadL = isPrint ? 42 : 50;
    const lPadR = isPrint ? 18 : 26;
    const lPadT = isPrint ? 24 : 28;
    const lPadB = isPrint ? 58 : 64;
    const lPlotW = LW - lPadL - lPadR;
    const lPlotH = LH - lPadT - lPadB;
    const plotBottom = lPadT + lPlotH;
    const yearLabelY = plotBottom + (isPrint ? 16 : 18);
    const hireStripY = plotBottom + (isPrint ? 22 : 25);
    const hireStripH = isPrint ? 22 : 24;
    const compactHireLabel = isPrint && allRows.length > 17;

    const vals = allRows.flatMap(r => [r.total, r.under60, r.yearTarget, base.totalPlacedCount]);
    const rawMin = Math.min(...vals);
    const rawMax = Math.max(...vals);
    const span = Math.max(20, rawMax - rawMin);
    const minY = Math.max(0, Math.floor((rawMin - span * 0.24) / 5) * 5);
    const maxY = Math.ceil((rawMax + span * 0.22) / 5) * 5 || 100;
    const yScale = v => lPadT + lPlotH - ((v - minY) / Math.max(1, maxY - minY)) * lPlotH;
    const xScale = i => lPadL + (i / Math.max(1, allRows.length - 1)) * lPlotW;

    const ptsTarget = allRows.map((r, i) => `${xScale(i)},${yScale(r.yearTarget)}`).join(' ');
    const ptsTotal = allRows.map((r, i) => `${xScale(i)},${yScale(r.total)}`).join(' ');
    const ptsUnder60 = allRows.map((r, i) => `${xScale(i)},${yScale(r.under60)}`).join(' ');
    const goalIdx = Math.min(allRows.length - 1, sim.goalYears);
    const goalX = xScale(goalIdx);

    const minUnder60Row = allRows.reduce((m, r) => (r.under60 < m.under60 ? r : m), allRows[0]);
    const peak60Row = allRows.reduce((m, r) => (r.age60to64 > m.age60to64 ? r : m), allRows[0]);
    const goalRow = allRows[goalIdx];
    const goalDiff = Math.round(goalRow.total) - sim.goalHeadcount;
    const endRow = allRows[allRows.length - 1];
    const endDiff = Math.round(endRow.total) - endRow.yearTarget;

    const y1 = rows[0] || { year: base.baseYear + 1, hires: 0 };
    const maxHireRow = rows.reduce((m, r) => (r.hires > m.hires ? r : m), y1);
    const minHireRow = rows.reduce((m, r) => (r.hires < m.hires ? r : m), y1);

    return (
      <div className={isPrint ? 'space-y-3' : 'space-y-4'}>
        {/* 上段: 年度別イベント人数棒グラフ */}
        <div className="space-y-1.5 sim-avoid-break">
          <div className={`flex flex-wrap items-center justify-between gap-1.5 ${isPrint ? 'text-[10.5px]' : 'text-xs'}`}>
            <div className="font-bold text-slate-800">①-1 年度別イベント人数（65歳定年退職等・60歳役職定年・正職員採用数）</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <SvgSwatch variant="vermilionStripe" />
                65歳定年退職等（斜線）
              </span>
              <span className="inline-flex items-center gap-1">
                <SvgSwatch variant="yellow" />
                60歳役職定年（黄）
              </span>
              <span className="inline-flex items-center gap-1">
                <SvgSwatch variant="blue" />
                計画採用数（青）
              </span>
            </div>
          </div>

          <div className={isPrint ? 'w-full' : 'w-full overflow-x-auto'}>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={isPrint ? { width: '100%', height: 'auto', display: 'block' } : { width: '100%', minWidth: `${W}px`, maxHeight: '256px' }}
            >
              <defs>
                <pattern id={barPatId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill={CUD.vermilion} />
                  <line x1="0" y1="0" x2="0" y2="6" stroke={CUD.vermilionStripe} strokeWidth="2.2" />
                </pattern>
              </defs>
              {[0, 1, 2, 3, 4].map(g => {
                const val = Math.round((maxVal / 4) * g);
                const y = padT + plotH - (val / maxVal) * plotH;
                return (
                  <g key={g}>
                    <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                    <text x={padL - 5} y={y + 4} textAnchor="end" fontSize={isPrint ? '10' : '11'} fill="#64748b">{val}</text>
                  </g>
                );
              })}
              {rows.map((r, i) => {
                const cx = padL + stepW * (i + 0.5);
                const cxRet = cx - barGap;
                const cxYak = cx;
                const cxHir = cx + barGap;
                const hRet = (r.retire65Count / maxVal) * plotH;
                const hYak = (r.yakushoku60Count / maxVal) * plotH;
                const hHir = (r.hires / maxVal) * plotH;
                const yTopRet = padT + plotH - hRet;
                const yTopYak = padT + plotH - hYak;
                const yTopHir = padT + plotH - hHir;
                const shortEra = `R${r.year - 2018}`;

                return (
                  <g
                    key={r.year}
                    className={isPrint ? undefined : 'cursor-pointer'}
                    onMouseMove={
                      isPrint
                        ? undefined
                        : (e) =>
                            showFloatingTip(
                              e,
                              <div className="space-y-1">
                                <div className="font-bold text-slate-900">
                                  {formatSimEraYear(r.year)}年度{r.isGoalYear ? '（★目標到達年）' : ''}
                                </div>
                                <div>65歳定年退職等: <b style={{ color: CUD.vermilionText }}>{r.retire65Count}名</b></div>
                                {r.retire65Names.length > 0 && (
                                  <div className="text-slate-500">
                                    退職対象: {r.retire65Names.slice(0, 12).join('、')}{r.retire65Names.length > 12 ? ' ほか' : ''}
                                  </div>
                                )}
                                <div>60歳役職定年: <b style={{ color: CUD.yellowText }}>{r.yakushoku60Count}名</b></div>
                                {r.yakushoku60Names.length > 0 && (
                                  <div className="text-slate-500">
                                    役職定年: {r.yakushoku60Names.slice(0, 12).join('、')}{r.yakushoku60Names.length > 12 ? ' ほか' : ''}
                                  </div>
                                )}
                                <div>計画採用数(正職員): <b style={{ color: CUD.blueText }}>{r.hires}名</b></div>
                                {sim.strategy === 'replace' && r.step === 1 && base.tempCount > 0 && (
                                  <div style={{ color: CUD.blueText }}>※現臨任{base.tempCount}名分の正職員化を含む</div>
                                )}
                              </div>
                            )
                    }
                    onMouseLeave={isPrint ? undefined : hideFloatingTip}
                  >
                    <rect x={cx - stepW / 2} y={padT - 16} width={stepW} height={plotH + 16} fill="transparent" />
                    <rect x={cxRet - barW / 2} y={yTopRet} width={barW} height={hRet} rx="1.5" fill={`url(#${barPatId})`} stroke={CUD.vermilion} strokeWidth="0.8" />
                    <rect x={cxYak - barW / 2} y={yTopYak} width={barW} height={hYak} rx="1.5" fill={CUD.yellow} stroke={CUD.yellowStroke} strokeWidth="0.9" />
                    <rect x={cxHir - barW / 2} y={yTopHir} width={barW} height={hHir} rx="1.5" fill={CUD.blue} />
                    <text x={cxRet} y={yTopRet - 3.5} textAnchor="middle" fontSize={barNumFont} fontFamily="monospace" fontWeight={r.retire65Count > 0 ? '700' : '400'} fill={r.retire65Count > 0 ? CUD.vermilionText : '#64748b'} style={HALO_CARD_STYLE}>{r.retire65Count}</text>
                    <text x={cxYak} y={yTopYak - 3.5} textAnchor="middle" fontSize={barNumFont} fontFamily="monospace" fontWeight={r.yakushoku60Count > 0 ? '700' : '400'} fill={r.yakushoku60Count > 0 ? CUD.yellowText : '#64748b'} style={HALO_CARD_STYLE}>{r.yakushoku60Count}</text>
                    <text x={cxHir} y={yTopHir - 3.5} textAnchor="middle" fontSize={barNumFont} fontFamily="monospace" fontWeight={r.hires > 0 ? '700' : '400'} fill={r.hires > 0 ? CUD.blueText : '#64748b'} style={HALO_CARD_STYLE}>{r.hires}</text>
                    <text x={cx} y={H - 9} textAnchor="middle" fontSize={isPrint ? '10' : '11'} fontWeight={r.isGoalYear ? '700' : '400'} fill={r.isGoalYear ? CUD.blueText : '#64748b'}>
                      {shortEra}{r.isGoalYear ? '★' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 下段: 正職員充足数・担い手層推移折れ線グラフ + 欄外採用数 + 診断ポイント */}
        <div className={`border-t border-slate-300 ${isPrint ? 'pt-2.5 space-y-1.5' : 'pt-3 space-y-2'} sim-avoid-break`}>
          <div className={`flex flex-wrap items-center justify-between gap-1.5 ${isPrint ? 'text-[10.5px]' : 'text-xs'}`}>
            <div className="font-bold text-slate-800">①-2 正職員充足数（育代含）と「59歳以下・現役役職担い手層」の推移</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <svg width="18" height="12" viewBox="0 0 20 12" className="inline-block shrink-0">
                  <line x1="1" y1="6" x2="19" y2="6" stroke={CUD.blue} strokeWidth="2.4" />
                  <circle cx="10" cy="6" r="3.5" fill={CUD.blue} />
                </svg>
                <span>{isReplaceTemp ? '正職員数（育代含・臨任除）' : '在籍総数（臨・育含）'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <svg width="18" height="12" viewBox="0 0 20 12" className="inline-block shrink-0">
                  <line x1="1" y1="6" x2="19" y2="6" stroke={CUD.vermilion} strokeWidth="2.2" strokeDasharray="3,2" />
                  <polygon points="10,2 14,6 10,10 6,6" fill={CUD.vermilion} />
                </svg>
                <span>59歳以下（担い手層）</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <svg width="16" height="12" viewBox="0 0 18 12" className="inline-block shrink-0">
                  <line x1="1" y1="6" x2="17" y2="6" stroke="#64748b" strokeWidth="2" strokeDasharray="4,3" />
                </svg>
                <span>
                  {sim.startHeadcount === sim.goalHeadcount
                    ? `目標（${sim.goalHeadcount}名維持）`
                    : `段階目標（${sim.startHeadcount}→${sim.goalYears}年後${sim.goalHeadcount}名）`}
                </span>
              </span>
            </div>
          </div>

          <div className={isPrint ? 'w-full' : 'w-full overflow-x-auto'}>
            <svg
              viewBox={`0 0 ${LW} ${LH}`}
              style={isPrint ? { width: '100%', height: 'auto', display: 'block' } : { width: '100%', minWidth: `${LW}px`, maxHeight: '292px' }}
            >
              {[0, 1, 2, 3, 4].map(g => {
                const val = Math.round(minY + ((maxY - minY) / 4) * g);
                const y = yScale(val);
                return (
                  <g key={g}>
                    <line x1={lPadL} y1={y} x2={LW - lPadR} y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                    <text x={lPadL - 6} y={y + 4} textAnchor="end" fontSize={isPrint ? '10' : '11'} fill="#64748b">{val}</text>
                  </g>
                );
              })}

              {/* 欄外下部：各年度の採用人数ストリップ */}
              <rect x="2" y={hireStripY} width={LW - 4} height={hireStripH} rx="3.5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
              <text x={lPadL - 5} y={hireStripY + 15} textAnchor="end" fontSize="9.5" fontWeight="700" fill={CUD.blueText}>
                {compactHireLabel ? '採用' : '採用数'}
              </text>

              {/* 目標到達年縦ガイドと段階目標ライン */}
              <line x1={goalX} y1={lPadT - 8} x2={goalX} y2={plotBottom} stroke="#cbd5e1" strokeWidth="1.4" strokeDasharray="3,3" />
              <polyline fill="none" stroke="#64748b" strokeWidth="1.8" strokeDasharray="6,4" points={ptsTarget} />

              <polyline fill="none" stroke={CUD.blue} strokeWidth="2.6" points={ptsTotal} />
              <polyline fill="none" stroke={CUD.vermilion} strokeWidth="2.3" strokeDasharray="5,3" points={ptsUnder60} />

              {isReplaceTemp && base.tempCount > 0 && (
                <circle cx={xScale(0)} cy={yScale(base.totalPlacedCount)} r="5" fill="none" stroke={CUD.yellowStroke} strokeWidth="2" />
              )}

              {allRows.map((r, i) => {
                const x = xScale(i);
                const yTot = yScale(r.total);
                const yU60 = yScale(r.under60);
                const totNum = Math.round(r.total);
                const u60Num = Math.round(r.under60);
                const shortEra = `R${r.year - 2018}`;
                const dSize = isPrint ? 4.2 : 4.6;
                const diamondPts = `${x},${yU60 - dSize} ${x + dSize},${yU60} ${x},${yU60 + dSize} ${x - dSize},${yU60}`;
                const diff = totNum - r.yearTarget;

                return (
                  <g
                    key={r.year}
                    className={isPrint ? undefined : 'cursor-pointer'}
                    onMouseMove={
                      isPrint
                        ? undefined
                        : (e) =>
                            showFloatingTip(
                              e,
                              <div className="space-y-1">
                                <div className="font-bold text-slate-900">
                                  {formatSimEraYear(r.year)}年度当初{r.isGoalYear ? '（★目標到達年）' : ''}
                                </div>
                                {r.isBase && isReplaceTemp && base.tempCount > 0 && (
                                  <div style={{ color: CUD.yellowText }}>
                                    基準配置総数(臨任{base.tempCount}名含): <b>{base.totalPlacedCount}名</b>
                                  </div>
                                )}
                                {!r.isBase && diff < 0 && sim.strategy === 'level' && isReplaceTemp && (
                                  <div style={{ color: CUD.vermilionText }}>
                                    段階目標比 不足残: <b>{Math.abs(diff)}名</b>
                                  </div>
                                )}
                                <div>計画採用数(正職員): <b style={{ color: CUD.blueText }}>{r.hires}名</b></div>
                                <div>年度目標: <b>{r.yearTarget}名</b></div>
                                <div>
                                  ● {isReplaceTemp ? '正職員数(育代含)' : '在籍総数'}:{' '}
                                  <b style={{ color: CUD.blueText }}>{totNum}名</b> (目標比 {diff >= 0 ? `+${diff}` : diff}名)
                                </div>
                                <div>◆ 59歳以下(現役担い手): <b style={{ color: CUD.vermilionText }}>{u60Num}名</b></div>
                                <div>60-64歳(役職定年層): <b>{Math.round(r.age60to64)}名</b></div>
                              </div>
                            )
                    }
                    onMouseLeave={isPrint ? undefined : hideFloatingTip}
                  >
                    <circle cx={x} cy={yTot} r={r.isGoalYear ? '4.8' : '3.9'} fill={CUD.blue} stroke="#ffffff" strokeWidth="1.1" />
                    <polygon points={diamondPts} fill={CUD.vermilion} stroke="#ffffff" strokeWidth="1" />
                    <text x={x} y={yTot - 7} textAnchor="middle" fontSize={isPrint ? '9.6' : '10.5'} fontFamily="monospace" fontWeight="700" fill={CUD.blueText} style={HALO_CARD_STYLE}>{totNum}</text>
                    <text x={x} y={yU60 + 14} textAnchor="middle" fontSize={isPrint ? '9.6' : '10.5'} fontFamily="monospace" fontWeight="700" fill={CUD.vermilionText} style={HALO_CARD_STYLE}>{u60Num}</text>
                    <text x={x} y={yearLabelY} textAnchor="middle" fontSize={isPrint ? '10' : '11'} fontWeight={r.isGoalYear ? '700' : '400'} fill={r.isGoalYear ? CUD.blueText : '#64748b'}>
                      {shortEra}{r.isGoalYear ? '★' : ''}
                    </text>
                    <text x={x} y={hireStripY + 15} textAnchor="middle" fontSize={isPrint ? '9.5' : '10.5'} fontFamily="monospace" fontWeight={r.hires > 0 ? '700' : '400'} fill={r.hires > 0 ? CUD.blueText : '#64748b'}>
                      {compactHireLabel ? r.hires : `${r.hires}名`}
                    </text>
                    {!isPrint && <rect x={x - 20} y={lPadT - 16} width="40" height={lPlotH + 66} fill="transparent" />}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Diagnostic Box */}
          <div className={`${isPrint ? 'text-[10px] px-2.5 py-1.5 leading-snug' : 'text-xs p-2.5'} rounded-md bg-slate-100 border border-slate-300 space-y-0.5 text-slate-700 sim-avoid-break`}>
            {sim.strategy === 'replace' ? (
              <>
                <div className="font-bold text-slate-900">
                  💡 診断ポイント（単年度欠員補充：現状{sim.startHeadcount}名 → {sim.goalYears}年後{sim.goalHeadcount}名）
                </div>
                <div>
                  ・段階目標ライン（現状{sim.startHeadcount}名 → <b>{formatSimEraYear(goalRow.year)}年度に{sim.goalHeadcount}名</b>）に沿って、臨任を使わず毎年必要数全員を正職員で採用します（初年度採用: <b>{y1.hires}名</b> ／ 期間中最小 <b>{minHireRow.hires}名［{formatSimEraYear(minHireRow.year)}］</b> 〜 最大 <b>{maxHireRow.hires}名［{formatSimEraYear(maxHireRow.year)}］</b>）。
                </div>
                <div>
                  ・60〜64歳（役職定年層）は <b>{formatSimEraYear(peak60Row.year)}年度</b> に最大 <b>{Math.round(peak60Row.age60to64)}名</b>、59歳以下現役層は <b>{formatSimEraYear(minUnder60Row.year)}年度に最小 {Math.round(minUnder60Row.under60)}名</b> となります。
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-slate-900">
                  💡 診断ポイント（平準化採用：現状{sim.startHeadcount}名 → {sim.goalYears}年後{sim.goalHeadcount}名）
                </div>
                <div>
                  ・目標年である <b>{sim.goalYears}年後（{formatSimEraYear(goalRow.year)}年度★）</b> 時点の正職員数は <b>{Math.round(goalRow.total)}名</b>（目標{sim.goalHeadcount}名に対し <b>{goalDiff >= 0 ? `+${goalDiff}` : goalDiff}名</b>）、最終年度（{formatSimEraYear(endRow.year)}）は <b>{Math.round(endRow.total)}名</b>（目標比 {endDiff >= 0 ? `+${endDiff}` : endDiff}名）です。
                </div>
                <div>
                  ・60〜64歳（役職定年層）は <b>{formatSimEraYear(peak60Row.year)}年度</b> に最大 <b>{Math.round(peak60Row.age60to64)}名</b> に達し、59歳以下の現役担い手層は <b>{formatSimEraYear(minUnder60Row.year)}年度に最小 {Math.round(minUnder60Row.under60)}名</b> となります。
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ====== Tab 2: Managerial Post Supply / Demand ======
  const renderPostsSection = (idSuffix = 'main', isPrint = false) => {
    const leaderPosts = Math.max(1, base.leaderPosts || 1);
    const ratios = sim.yearly.map(r => ({ year: r.year, ratio: r.age45to59 / leaderPosts }));
    const minRatioObj = ratios.reduce((m, x) => (x.ratio < m.ratio ? x : m), ratios[0]);

    const rows = sim.yearly;
    const W = isPrint ? Math.max(668, rows.length * 34 + 84) : Math.max(760, rows.length * 50 + 96);
    const H = isPrint ? 232 : 286;
    const padL = isPrint ? 36 : 42;
    const padR = isPrint ? 50 : 54;
    const padT = isPrint ? 23 : 26;
    const padB = isPrint ? 28 : 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const maxVal = Math.max(...rows.map(r => r.total), leaderPosts * 1.4, 20) * 1.12;
    const yScale = v => padT + plotH - (v / maxVal) * plotH;
    const stepW = plotW / Math.max(1, rows.length);
    const barW = isPrint ? Math.min(20, Math.max(11, stepW * 0.55)) : Math.min(25, Math.max(15, stepW * 0.54));
    const leaderY = yScale(base.leaderPosts);
    const postPatId = `sim-post-verm-${idSuffix}`;

    return (
      <div className={isPrint ? 'space-y-2 sim-avoid-break' : 'space-y-4 sim-avoid-break'}>
        <div className={`grid grid-cols-3 ${isPrint ? 'gap-2 text-[10px]' : 'gap-3 text-xs'}`}>
          <div className={isPrint ? 'px-2.5 py-1.5 rounded-md bg-slate-100 border border-slate-300' : 'p-3 rounded-lg bg-slate-100 border border-slate-300'}>
            <div className="text-slate-500">現在の課長級以上ポスト数</div>
            <div className={isPrint ? 'text-sm font-bold font-mono text-slate-900' : 'text-lg font-bold font-mono text-slate-900 mt-0.5'}>
              {base.upperPosts}枠
              {isPrint && <span className="ml-1.5 text-[9px] font-sans font-normal text-slate-500">(部・次・所属長・課長級)</span>}
            </div>
            {!isPrint && <div className="text-slate-500 mt-0.5">部長・次長・所属長・課長級</div>}
          </div>
          <div className={isPrint ? 'px-2.5 py-1.5 rounded-md bg-slate-100 border border-slate-300' : 'p-3 rounded-lg bg-slate-100 border border-slate-300'}>
            <div className="text-slate-500">現在の班長級以上ポスト総数</div>
            <div className={isPrint ? 'text-sm font-bold font-mono text-slate-900' : 'text-lg font-bold font-mono text-slate-900 mt-0.5'}>
              {base.leaderPosts}枠
              {isPrint && <span className="ml-1.5 text-[9px] font-sans font-normal text-slate-500">(課長級以上＋補佐III・II)</span>}
            </div>
            {!isPrint && <div className="text-slate-500 mt-0.5">課長級以上＋補佐級III・II</div>}
          </div>
          <div className={isPrint ? 'px-2.5 py-1.5 rounded-md bg-slate-100 border border-slate-300' : 'p-3 rounded-lg bg-slate-100 border border-slate-300'}>
            <div className="text-slate-500">最低「管理監督職カバー倍率」</div>
            <div className={isPrint ? 'text-sm font-bold font-mono text-slate-900' : 'text-lg font-bold font-mono text-slate-900 mt-0.5'}>
              {minRatioObj.ratio.toFixed(2)}倍 ({formatSimEraYear(minRatioObj.year)})
            </div>
            {!isPrint && <div className="text-slate-500 mt-0.5">45〜59歳人数 ÷ 班長級以上枠数</div>}
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-1.5 ${isPrint ? 'text-[10.5px]' : 'text-xs'}`}>
          <div className="font-bold text-slate-800">② 世代別構成の推移 vs 班長級以上ポスト枠（下から積上げ）</div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="navy" />45-59歳(濃青)
            </span>
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="sky" />35-44歳(水色)
            </span>
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="yellow" />34歳以下(黄)
            </span>
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="vermilionStripe" />60-64歳(朱斜線)
            </span>
          </div>
        </div>

        <div className={isPrint ? 'w-full' : 'w-full overflow-x-auto'}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={isPrint ? { width: '100%', height: 'auto', display: 'block' } : { width: '100%', minWidth: `${W}px`, maxHeight: '310px' }}
          >
            <defs>
              <pattern id={postPatId} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="6" height="6" fill={CUD.vermilion} />
                <line x1="0" y1="0" x2="0" y2="6" stroke={CUD.vermilionStripe} strokeWidth="2.2" />
              </pattern>
            </defs>

            {[0, 1, 2, 3, 4].map(g => {
              const val = Math.round((maxVal / 4) * g);
              const y = yScale(val);
              return (
                <g key={g}>
                  <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                  <text x={padL - 5} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">{val}</text>
                </g>
              );
            })}

            {rows.map((r, i) => {
              const cx = padL + stepW * (i + 0.5);
              const segs = [
                { key: '45-59', val: r.age45to59, fill: CUD.navy, stroke: '#ffffff', txtFill: '#FFFFFF', halo: HALO_DARK_STYLE },
                { key: '35-44', val: r.age35to44, fill: CUD.sky, stroke: '#ffffff', txtFill: '#0F172A', halo: HALO_LIGHT_STYLE },
                { key: 'u35', val: r.under35, fill: CUD.yellow, stroke: '#ffffff', txtFill: '#0F172A', halo: HALO_LIGHT_STYLE },
                { key: '60-64', val: r.age60to64, fill: `url(#${postPatId})`, stroke: CUD.vermilion, txtFill: '#0F172A', halo: HALO_LIGHT_STYLE }
              ];

              let acc = 0;
              let prevCenterY = null;
              let topBarY = yScale(0);
              const rectEls = [];
              const labelEls = [];

              segs.forEach(sg => {
                const yTop = yScale(acc + sg.val);
                const yBot = yScale(acc);
                const h = Math.max(0, yBot - yTop);
                const rounded = Math.round(sg.val);
                if (h > 0.2) {
                  rectEls.push(
                    <rect key={sg.key} x={cx - barW / 2} y={yTop} width={barW} height={h} fill={sg.fill} stroke={sg.stroke} strokeWidth="0.7" />
                  );
                  topBarY = yTop;
                }
                if (rounded > 0) {
                  const cy = (yTop + yBot) / 2 + 3;
                  if (h >= 9 || prevCenterY === null || prevCenterY - cy >= 9) {
                    labelEls.push(
                      <text key={`lbl-${sg.key}`} x={cx} y={cy} textAnchor="middle" fontSize="8.5" fontFamily="monospace" fontWeight="700" fill={sg.txtFill} style={{ pointerEvents: 'none', ...sg.halo }}>
                        {rounded}
                      </text>
                    );
                    prevCenterY = cy;
                  } else {
                    labelEls.push(
                      <text key={`lbl-${sg.key}`} x={cx + barW / 2 + 3.5} y={cy} textAnchor="start" fontSize="7.8" fontFamily="monospace" fontWeight="700" fill="#0f172a" style={{ pointerEvents: 'none', ...HALO_CARD_STYLE }}>
                        {rounded}
                      </text>
                    );
                  }
                }
                acc += sg.val;
              });

              const totRounded = Math.round(r.total);
              const totLabelY = prevCenterY !== null ? Math.min(topBarY - 3.5, prevCenterY - 9.5) : topBarY - 3.5;
              const cov = (r.age45to59 / leaderPosts).toFixed(2);

              return (
                <g
                  key={r.year}
                  className={isPrint ? undefined : 'cursor-pointer'}
                  onMouseMove={
                    isPrint
                      ? undefined
                      : (e) =>
                          showFloatingTip(
                            e,
                            <div className="space-y-1">
                              <div className="font-bold text-slate-900">
                                {formatSimEraYear(r.year)}年度 世代別内訳（計 {totRounded}名）
                              </div>
                              <div>60-64歳(役職定年層): <b>{Math.round(r.age60to64)}名</b></div>
                              <div>34歳以下(若手層): <b>{Math.round(r.under35)}名</b></div>
                              <div>35-44歳(中堅層): <b>{Math.round(r.age35to44)}名</b></div>
                              <div>45-59歳(管理監督職適齢): <b>{Math.round(r.age45to59)}名</b>（ポスト比 {cov}倍）</div>
                            </div>
                          )
                  }
                  onMouseLeave={isPrint ? undefined : hideFloatingTip}
                >
                  <rect x={cx - stepW / 2} y={padT - 14} width={stepW} height={plotH + 14} fill="transparent" />
                  {rectEls}
                  {labelEls}
                  <text x={cx} y={totLabelY} textAnchor="middle" fontSize="8.8" fontFamily="monospace" fontWeight="700" fill="#0f172a" style={{ pointerEvents: 'none', ...HALO_CARD_STYLE }}>
                    {totRounded}
                  </text>
                  <text x={cx} y={H - 9} textAnchor="middle" fontSize={isPrint ? '10' : '11'} fill="#64748b">R{r.year - 2018}</text>
                </g>
              );
            })}

            {base.leaderPosts > 0 && (
              <g style={{ pointerEvents: 'none' }}>
                <line x1={padL} y1={leaderY} x2={W - padR} y2={leaderY} stroke={CUD.refHalo} strokeWidth="4.2" />
                <line x1={padL} y1={leaderY} x2={W - padR} y2={leaderY} stroke={CUD.refLine} strokeWidth="2" strokeDasharray="6,4" />
                <text x={W - padR + 4} y={leaderY - 2} textAnchor="start" fontSize="8.8" fontWeight="bold" fill={CUD.refLine}>◀ポスト</text>
                <text x={W - padR + 4} y={leaderY + 9} textAnchor="start" fontSize="9.2" fontFamily="monospace" fontWeight="bold" fill={CUD.refLine}>
                  {base.leaderPosts}枠
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className={`${isPrint ? 'text-[10px] px-2.5 py-1.5 leading-snug' : 'text-xs p-2.5'} rounded-md bg-slate-100 border border-slate-300 text-slate-700`}>
          {minRatioObj.ratio < 1.15 ? (
            <span>
              ⚠️ <b>{formatSimEraYear(minRatioObj.year)}年度前後</b>に「45〜59歳（管理監督職の主たる担い手層：濃青バー）」が班長級以上ポスト数（{base.leaderPosts}枠）に対して <b>{minRatioObj.ratio.toFixed(2)}倍</b> まで逼迫します。30代後半〜40代前半からの早期登用やポスト再編の検討が必要です。
            </span>
          ) : (
            <span>
              ✅ 分析期間を通じて、45〜59歳層（濃青バー）は班長級以上ポスト数（{base.leaderPosts}枠）に対し最低でも <b>{minRatioObj.ratio.toFixed(2)}倍</b> を確保できています。ただし34歳以下の若手層（黄色バー）が薄くならないよう継続的な採用が重要です。
            </span>
          )}
        </div>
      </div>
    );
  };

  // ====== Vector SVG Age Pyramid Column Renderer (Print-Color & Portrait-Safe) ======
  const renderPyramidSvgColumn = (snap, scaleMax, colTitle, idKey, compact = false, isPrint = false) => {
    const ages = [];
    for (let a = 64; a >= 22; a--) ages.push(a);

    const rowH = isPrint ? (compact ? 10.1 : 13.4) : compact ? 7.6 : 8.2;
    const topPad = isPrint ? 4 : 3;
    const svgW = isPrint ? (compact ? 226 : 650) : compact ? 310 : 620;
    const labelW = compact ? (isPrint ? 28 : 26) : isPrint ? 34 : 30;
    const rightPad = compact ? (isPrint ? 48 : 54) : isPrint ? 86 : 74;
    const barMaxW = svgW - labelW - rightPad;
    const svgH = topPad + ages.length * rowH + (isPrint ? 4 : 3);
    const vermPat = `pyr-verm-${idKey}`;
    const skyPat = `pyr-sky-${idKey}`;

    return (
      <div
        className={`border border-slate-300 rounded-md ${
          isPrint ? 'p-1.5' : compact ? 'p-2' : 'p-2.5 max-w-[920px] mx-auto w-full'
        } bg-white sim-avoid-break`}
      >
        {compact && isPrint ? (
          <div className="border-b border-slate-200 pb-1 mb-1 leading-tight">
            <div className="font-bold text-[10px] text-slate-900">{colTitle}</div>
            <div className="font-mono text-[9px] text-slate-600 mt-0.5">
              計<b>{Math.round(snap.total)}</b>名 (59以下:{Math.round(snap.under60)} / 60-64:{Math.round(snap.age60to64)})
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline justify-between gap-1 border-b border-slate-200 pb-1 mb-1">
            <span className="font-bold text-xs text-slate-900">{colTitle}</span>
            <span className="font-mono text-[11px] text-slate-600">
              計<b>{Math.round(snap.total)}</b>名 (59以下:{Math.round(snap.under60)} / 60-64:{Math.round(snap.age60to64)})
            </span>
          </div>
        )}
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <defs>
            <pattern id={vermPat} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="5" height="5" fill={CUD.vermilion} />
              <line x1="0" y1="0" x2="0" y2="5" stroke={CUD.vermilionStripe} strokeWidth="2" />
            </pattern>
            <pattern id={skyPat} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="5" height="5" fill={CUD.sky} />
              <line x1="0" y1="0" x2="0" y2="5" stroke={CUD.skyLight} strokeWidth="2" />
            </pattern>
          </defs>

          {ages.map((age, idx) => {
            const y = topPad + idx * rowH;
            const barH = Math.max(4, rowH - (isPrint ? 2.0 : 1.3));
            const textBaseY = y + barH - (isPrint ? 1.2 : 0.6);
            const innerBaseY = y + barH - (isPrint ? 1.5 : 0.8);
            const bin = snap.ageBins[age] || { existing: 0, hired: 0 };
            const exW = Math.max(0, (bin.existing / scaleMax) * barMaxW);
            const hiW = Math.max(0, (bin.hired / scaleMax) * barMaxW);
            const tot = bin.existing + bin.hired;
            const hasBoth = bin.existing >= 0.05 && bin.hired >= 0.05;
            const innerMinW = compact ? 14 : 18;

            let tipText = fmtCompactInt(tot);
            if (hasBoth && (exW < innerMinW || hiW < innerMinW)) {
              tipText = compact
                ? `${fmtCompactInt(tot)}(${fmtCompactInt(bin.existing)}+${fmtCompactInt(bin.hired)})`
                : `${fmtCompactInt(tot)}(現${fmtCompactInt(bin.existing)}+新${fmtCompactInt(bin.hired)})`;
            }

            return (
              <g key={age}>
                {age === 59 && (
                  <line
                    x1={0}
                    y1={y - 0.8}
                    x2={svgW}
                    y2={y - 0.8}
                    stroke={CUD.vermilion}
                    strokeWidth="1.1"
                    strokeDasharray="4,3"
                  />
                )}
                <text
                  x={labelW - 4}
                  y={textBaseY}
                  textAnchor="end"
                  fontSize={isPrint ? (compact ? '8.0' : '10') : compact ? '7.0' : '7.6'}
                  fontFamily="monospace"
                  fill="#64748b"
                >
                  {age}歳
                </text>
                <rect x={labelW} y={y} width={barMaxW} height={barH} rx="1" fill="#f1f5f9" />
                {exW > 0.2 && (
                  <rect
                    x={labelW}
                    y={y}
                    width={exW}
                    height={barH}
                    rx="1"
                    fill={age >= 60 ? `url(#${vermPat})` : CUD.navy}
                    stroke={age >= 60 ? CUD.vermilion : 'none'}
                    strokeWidth={age >= 60 ? '0.6' : '0'}
                  />
                )}
                {hiW > 0.2 && (
                  <rect
                    x={labelW + exW}
                    y={y}
                    width={hiW}
                    height={barH}
                    rx="1"
                    fill={`url(#${skyPat})`}
                    stroke="#0284C7"
                    strokeWidth="0.5"
                  />
                )}
                {hasBoth && exW >= innerMinW && (
                  <text
                    x={labelW + exW / 2}
                    y={innerBaseY}
                    textAnchor="middle"
                    fontSize={isPrint ? (compact ? '7.2' : '8.5') : compact ? '6.6' : '7.2'}
                    fontFamily="monospace"
                    fontWeight="700"
                    fill={age >= 60 ? '#0F172A' : '#FFFFFF'}
                    style={age >= 60 ? HALO_LIGHT_STYLE : HALO_DARK_STYLE}
                  >
                    {fmtCompactInt(bin.existing)}
                  </text>
                )}
                {hasBoth && hiW >= innerMinW && (
                  <text
                    x={labelW + exW + hiW / 2}
                    y={innerBaseY}
                    textAnchor="middle"
                    fontSize={isPrint ? (compact ? '7.2' : '8.5') : compact ? '6.6' : '7.2'}
                    fontFamily="monospace"
                    fontWeight="700"
                    fill="#0F172A"
                    style={HALO_LIGHT_STYLE}
                  >
                    {fmtCompactInt(bin.hired)}
                  </text>
                )}
                <text
                  x={labelW + exW + hiW + 3.5}
                  y={textBaseY}
                  textAnchor="start"
                  fontSize={isPrint ? (compact ? '7.8' : '9.5') : compact ? '7.0' : '7.8'}
                  fontFamily="monospace"
                  fontWeight={tot >= 0.05 ? '700' : '400'}
                  fill={tot >= 0.05 ? '#0f172a' : '#94a3b8'}
                >
                  {tipText}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // ====== Tab 3: Age Pyramid Section ======
  const renderPyramidSection = (forceCompare3 = false, idSuffix = 'main', isPrint = false) => {
    const safeIdx = Math.min(sim.yearly.length - 1, pyramidIdx);
    const snap = sim.yearly[safeIdx];
    const maxBin = Math.max(8, ...sim.yearly.flatMap(yr => Object.values(yr.ageBins).map(b => b.existing + b.hired)));
    const scaleMax = maxBin * 1.16;

    const lastIdx = sim.yearly.length - 1;
    const midIdx =
      sim.goalYears > 0 && sim.goalYears < lastIdx
        ? sim.goalYears
        : Math.max(1, Math.floor(lastIdx / 2));
    const compareIndices = Array.from(new Set([0, midIdx, lastIdx]));

    const showCompare = forceCompare3 || pyramidViewMode === 'compare3';

    return (
      <div className={isPrint ? 'space-y-1.5 sim-avoid-break' : 'space-y-2 sim-avoid-break'}>
        <div className={`flex flex-wrap items-center justify-between gap-1.5 ${isPrint ? 'text-[10.5px]' : 'text-xs'}`}>
          <div className="font-bold text-slate-800">
            ③ 将来年齢ピラミッド推移
            {showCompare ? '（基準年・目標/中間年・最終年 比較）' : `（${formatSimEraYear(snap.year)}年度）`}
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="navy" />
              現職(59以下・濃青)
            </span>
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="skyStripe" />
              新規採用累積(水色斜線)
            </span>
            <span className="inline-flex items-center gap-1">
              <SvgSwatch variant="vermilionStripe" />
              60〜64歳(朱斜線)
            </span>
          </div>
        </div>

        {!isPrint && !forceCompare3 && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPyramidViewMode('single')}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer border ${
                  pyramidViewMode === 'single'
                    ? 'bg-[#0072B2] text-white border-[#0072B2]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                単年度スライダー再生
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlaying(false);
                  setPyramidViewMode('compare3');
                }}
                className={`px-2.5 py-1 rounded font-bold cursor-pointer border ${
                  pyramidViewMode === 'compare3'
                    ? 'bg-[#0072B2] text-white border-[#0072B2]'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                3時点並べて比較
              </button>
            </div>

            {pyramidViewMode === 'single' && (
              <div className="flex items-center gap-3 flex-1 min-w-[260px]">
                <button
                  type="button"
                  onClick={() => setIsPlaying(p => !p)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-white font-bold text-xs cursor-pointer"
                  style={{ backgroundColor: CUD.blue }}
                >
                  {isPlaying ? <><Pause className="w-3.5 h-3.5" /> 停止</> : <><Play className="w-3.5 h-3.5" /> 再生</>}
                </button>
                <input
                  type="range"
                  min="0"
                  max={sim.horizon}
                  value={safeIdx}
                  onChange={(e) => setPyramidIdx(Number(e.target.value))}
                  className="flex-1 accent-[#0072B2]"
                />
                <span className="font-mono font-bold text-slate-900">
                  {formatSimEraYear(snap.year)}年度（{Math.round(snap.total)}名）
                </span>
              </div>
            )}
          </div>
        )}

        {showCompare ? (
          <div className={`grid ${isPrint ? (compareIndices.length === 3 ? 'grid-cols-3 gap-2' : 'grid-cols-2 gap-2') : compareIndices.length === 3 ? 'grid-cols-1 md:grid-cols-3 gap-2.5' : 'grid-cols-1 md:grid-cols-2 gap-2.5'}`}>
            {compareIndices.map(idx => {
              const s = sim.yearly[idx];
              const tag = s.isBase
                ? '基準年度'
                : s.isGoalYear
                  ? `★目標年(${idx}年後)`
                  : idx === lastIdx
                    ? `最終年(${idx}年後)`
                    : `${idx}年後`;
              return (
                <React.Fragment key={s.year}>
                  {renderPyramidSvgColumn(s, scaleMax, `${formatSimEraYear(s.year)}［${tag}］`, `${idSuffix}-c${idx}`, true, isPrint)}
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          renderPyramidSvgColumn(
            snap,
            scaleMax,
            `${formatSimEraYear(snap.year)}年度${snap.isBase && isReplaceTemp && base.tempCount > 0 ? `（正職員${Math.round(snap.total)}名＋現臨任${base.tempCount}名）` : ''}`,
            `${idSuffix}-single`,
            false,
            isPrint
          )
        )}
      </div>
    );
  };

  // ====== Tab 4 (Screen): Interactive Detailed Table ======
  const renderScreenTableSection = () => (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="font-bold text-slate-800">
          ④ 年度別採用計画・人員推移一覧表
          {hasCustomHires && <span className="ml-2 text-[#0066A6] font-normal">（※ *印は手動調整値）</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={showNamesInTable}
              onChange={(e) => setShowNamesInTable(e.target.checked)}
              className="accent-[#0072B2]"
            />
            <span>画面にも退職・役職定年対象者の氏名列を表示</span>
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={printIncludeNames}
              onChange={(e) => setPrintIncludeNames(e.target.checked)}
              className="accent-[#0072B2]"
            />
            <span>印刷時に対象者氏名一覧（下段表）を含める</span>
          </label>
          <button
            type="button"
            onClick={() => exportSimulationCsv(sim, planName)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer hover:opacity-90"
            style={{ backgroundColor: CUD.blue }}
          >
            <Download className="w-3.5 h-3.5" /> CSVダウンロード
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded-lg">
        <table className="w-full text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-700">
              <th className="py-2 px-2 text-left font-bold whitespace-nowrap">年度</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">前年度末</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap" style={{ color: CUD.vermilionText }}>65歳退職等</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap" style={{ color: CUD.yellowText }}>60歳役職定年</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">時短・中途減</th>
              <th className="py-2 px-2 text-center font-bold whitespace-nowrap">計画採用数</th>
              <th className="py-2 px-2 text-right font-bold text-slate-900 whitespace-nowrap">
                {isReplaceTemp ? '正職員数(育代含)' : '在籍総数(臨・育含)'}
              </th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">59歳以下</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">60-64歳</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">年度目標</th>
              <th className="py-2 px-2 text-right font-bold whitespace-nowrap">
                {sim.strategy === 'replace' ? '目標比過不足' : '過不足(▲要臨任)'}
              </th>
              {showNamesInTable && (
                <>
                  <th className="py-2 px-2 text-left font-bold" style={{ color: CUD.vermilionText }}>
                    65歳定年退職等 対象者
                  </th>
                  <th className="py-2 px-2 text-left font-bold" style={{ color: CUD.yellowText }}>
                    60歳役職定年 対象者
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sim.yearly.map(r => {
              const diff = Math.round(r.total) - r.yearTarget;
              const diffColor = diff < -1 ? CUD.vermilionText : diff > 2 ? CUD.yellowText : CUD.blueText;
              const diffDisp =
                r.isBase && isReplaceTemp && diff < 0
                  ? `▲${Math.abs(diff)} (現臨任)`
                  : diff < 0
                    ? `▲${Math.abs(diff)}`
                    : diff > 0
                      ? `+${diff}`
                      : '0';

              return (
                <tr key={r.year} className={r.isGoalYear ? 'bg-sky-50/70 hover:bg-sky-100/70' : 'hover:bg-slate-50'}>
                  <td className="py-1.5 px-2 font-semibold text-slate-800 whitespace-nowrap">
                    {formatSimEraYear(r.year)}
                    {r.isBase && <span className="text-slate-500 font-normal ml-1">(基準)</span>}
                    {r.isGoalYear && <span className="font-bold ml-1" style={{ color: CUD.blueText }}>★目標</span>}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{r.isBase ? '-' : Math.round(r.prevTotal)}</td>
                  <td
                    className="py-1.5 px-2 text-right font-mono cursor-help"
                    style={{ color: CUD.vermilionText }}
                    title={r.retire65Names.length ? `65歳定年退職等: ${r.retire65Names.join('、')}` : undefined}
                  >
                    {r.isBase ? '-' : r.retire65Count > 0 ? `▲${r.retire65Count}` : '0'}
                  </td>
                  <td
                    className="py-1.5 px-2 text-right font-mono cursor-help"
                    style={{ color: CUD.yellowText }}
                    title={r.yakushoku60Names.length ? `60歳役職定年: ${r.yakushoku60Names.join('、')}` : undefined}
                  >
                    {r.yakushoku60Count}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">
                    {r.isBase ? '-' : r.attritionLoss > 0 ? `▲${Math.round(r.attritionLoss)}` : '0'}
                  </td>
                  <td className="py-1 px-2 text-center font-mono">
                    {r.isBase ? (
                      <span className="text-slate-400">{r.hires}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        max="80"
                        value={r.hires}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value) || 0);
                          setCustomHiresByYear(prev => ({ ...prev, [r.year]: v }));
                        }}
                        className="w-16 text-center rounded border px-1.5 py-0.5 font-mono bg-white"
                        style={r.isCustomHire ? { borderColor: CUD.blue, fontWeight: 700 } : { borderColor: '#cbd5e1' }}
                      />
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {Math.round(r.total)}
                    {r.isBase && isReplaceTemp && base.tempCount > 0 && (
                      <span className="font-normal text-slate-500 ml-1">(臨含{base.totalPlacedCount})</span>
                    )}
                  </td>
                  <td className="py-1.5 px-2 text-right font-mono">{Math.round(r.under60)}</td>
                  <td className="py-1.5 px-2 text-right font-mono">{Math.round(r.age60to64)}</td>
                  <td className="py-1.5 px-2 text-right font-mono text-slate-600">{r.yearTarget}</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold whitespace-nowrap" style={{ color: diffColor }}>
                    {diffDisp}
                  </td>
                  {showNamesInTable && (
                    <>
                      <td className="py-1.5 px-2 text-left text-[11px] leading-snug text-slate-700">
                        {r.isBase ? '-' : r.retire65Names.length > 0 ? r.retire65Names.join('、') : '-'}
                      </td>
                      <td className="py-1.5 px-2 text-left text-[11px] leading-snug text-slate-700">
                        {r.yakushoku60Names.length > 0 ? r.yakushoku60Names.join('、') : '-'}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ====== Tab 4 (A4 Portrait Print): 上段＝数値計画表 ／ 下段＝退職・役職定年対象者氏名一覧表 ======
  const renderPortraitPrintTables = () => (
    <div className="space-y-3.5">
      {/* 上段: 数値推移一覧表（A4縦幅にぴったり収まる11列構成） */}
      <div className="space-y-1">
        <div className="font-bold text-[11px] text-slate-800">
          ④-1 年度別採用計画・人員推移一覧表
          {hasCustomHires && <span className="ml-2 text-[#0066A6] font-normal text-[10px]">（※ *印は手動調整値）</span>}
        </div>

        <div className="border border-slate-400 rounded overflow-hidden">
          <table className="w-full border-collapse bg-white sim-plan-table">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-400 text-slate-700">
                <th className="text-left font-bold whitespace-nowrap">年度</th>
                <th className="text-right font-bold whitespace-nowrap">前年末</th>
                <th className="text-right font-bold whitespace-nowrap" style={{ color: CUD.vermilionText }}>65歳退職</th>
                <th className="text-right font-bold whitespace-nowrap" style={{ color: CUD.yellowText }}>60歳役定</th>
                <th className="text-right font-bold whitespace-nowrap">時短・他減</th>
                <th className="text-center font-bold whitespace-nowrap">計画採用</th>
                <th className="text-right font-bold text-slate-900 whitespace-nowrap">
                  {isReplaceTemp ? '正職員(育含)' : '総数(臨育含)'}
                </th>
                <th className="text-right font-bold whitespace-nowrap">59歳以下</th>
                <th className="text-right font-bold whitespace-nowrap">60-64歳</th>
                <th className="text-right font-bold whitespace-nowrap">年度目標</th>
                <th className="text-right font-bold whitespace-nowrap">
                  {sim.strategy === 'replace' ? '目標過不足' : '過不足(▲臨)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sim.yearly.map(r => {
                const diff = Math.round(r.total) - r.yearTarget;
                const diffColor = diff < -1 ? CUD.vermilionText : diff > 2 ? CUD.yellowText : CUD.blueText;
                const diffDisp =
                  r.isBase && isReplaceTemp && diff < 0
                    ? `▲${Math.abs(diff)}(現臨)`
                    : diff < 0
                      ? `▲${Math.abs(diff)}`
                      : diff > 0
                        ? `+${diff}`
                        : '0';

                return (
                  <tr key={r.year} className={r.isGoalYear ? 'bg-sky-50' : ''}>
                    <td className="font-semibold text-slate-800 whitespace-nowrap">
                      {formatSimEraYear(r.year)}
                      {r.isBase && <span className="text-slate-500 font-normal ml-0.5">(基)</span>}
                      {r.isGoalYear && <span className="font-bold ml-0.5" style={{ color: CUD.blueText }}>★</span>}
                    </td>
                    <td className="text-right font-mono">{r.isBase ? '-' : Math.round(r.prevTotal)}</td>
                    <td className="text-right font-mono" style={{ color: CUD.vermilionText }}>
                      {r.isBase ? '-' : r.retire65Count > 0 ? `▲${r.retire65Count}` : '0'}
                    </td>
                    <td className="text-right font-mono" style={{ color: CUD.yellowText }}>
                      {r.yakushoku60Count}
                    </td>
                    <td className="text-right font-mono text-slate-600">
                      {r.isBase ? '-' : r.attritionLoss > 0 ? `▲${Math.round(r.attritionLoss)}` : '0'}
                    </td>
                    <td className="text-center font-mono">
                      {r.isBase ? (
                        <span className="text-slate-400">{r.hires}</span>
                      ) : (
                        <span className="font-bold text-slate-900">
                          {r.hires}{r.isCustomHire ? '*' : ''}
                        </span>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {Math.round(r.total)}
                      {r.isBase && isReplaceTemp && base.tempCount > 0 && (
                        <span className="font-normal text-slate-500 ml-0.5">({base.totalPlacedCount})</span>
                      )}
                    </td>
                    <td className="text-right font-mono">{Math.round(r.under60)}</td>
                    <td className="text-right font-mono">{Math.round(r.age60to64)}</td>
                    <td className="text-right font-mono text-slate-600">{r.yearTarget}</td>
                    <td className="text-right font-mono font-bold whitespace-nowrap" style={{ color: diffColor }}>
                      {diffDisp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 下段: 年度別 退職・役職定年対象者氏名一覧（横レイアウト時の右端2列をA4縦向けに下段へ配置） */}
      {printIncludeNames && (
        <div className="space-y-1 pt-1">
          <div className="font-bold text-[11px] text-slate-800">
            ④-2 年度別 65歳定年退職等・60歳役職定年 対象者氏名一覧
          </div>
          <div className="border border-slate-400 rounded overflow-hidden">
            <table className="w-full border-collapse bg-white sim-plan-table">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-400 text-slate-700">
                  <th className="text-left font-bold whitespace-nowrap w-[86px]">年度</th>
                  <th className="text-left font-bold w-[46%]" style={{ color: CUD.vermilionText }}>
                    65歳定年退職等 対象者（計 {sumRetire}名）
                  </th>
                  <th className="text-left font-bold w-[46%]" style={{ color: CUD.yellowText }}>
                    60歳役職定年 対象者（基準年以降）
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sim.yearly.map(r => (
                  <tr key={`names-${r.year}`} className={r.isGoalYear ? 'bg-sky-50' : ''}>
                    <td className="font-semibold text-slate-800 whitespace-nowrap align-top">
                      {formatSimEraYear(r.year)}
                      {r.isBase && <span className="text-slate-500 font-normal ml-0.5">(基)</span>}
                      {r.isGoalYear && <span className="font-bold ml-0.5" style={{ color: CUD.blueText }}>★</span>}
                    </td>
                    <td className="text-left text-slate-800 leading-snug align-top">
                      {r.isBase ? (
                        <span className="text-slate-400">-</span>
                      ) : r.retire65Count > 0 ? (
                        <>
                          <span className="font-mono font-bold mr-1" style={{ color: CUD.vermilionText }}>
                            [{r.retire65Count}名]
                          </span>
                          <span>{r.retire65Names.join('、')}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">該当なし</span>
                      )}
                    </td>
                    <td className="text-left text-slate-800 leading-snug align-top">
                      {r.yakushoku60Count > 0 ? (
                        <>
                          <span className="font-mono font-bold mr-1" style={{ color: CUD.yellowText }}>
                            [{r.yakushoku60Count}名]
                          </span>
                          <span>{r.yakushoku60Names.join('、')}</span>
                        </>
                      ) : (
                        <span className="text-slate-400">該当なし</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ====== Print-Only Report Header & Assumptions Summary (A4縦幅最適化) ======
  const renderPrintReportHeader = (pageSubLabel = '') => {
    const modeLabel = isLevel
      ? `平準化採用（1〜${sim.goalYears}年目:${baseAnnualHire}名/年${sim.horizon > sim.goalYears ? `、到達後:${postGoalAnnualHire}名/年` : ''}${hasCustomHires ? '・個別調整有' : ''}）`
      : '単年度欠員補充（臨任なし・毎年必要数全員を正職員採用）';
    const tempLabel = isLevel
      ? isReplaceTemp
        ? '採用で正規置換'
        : '継続在籍扱い'
      : '臨任不使用';

    return (
      <div className="border-b-2 border-slate-800 pb-2 mb-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="text-[14px] font-bold text-slate-900 leading-tight">
            採用計画・人員構成シミュレーション報告書（{formatSimEraYear(targetYear)}年度案：{planName}）
            {pageSubLabel && <span className="ml-2 text-[11px] font-normal text-slate-600">{pageSubLabel}</span>}
          </h1>
          <div className="text-[9.5px] text-slate-600 font-mono">
            基準: {baseMode === 'next' ? `来年度(R${targetYear - 2018})配置案` : `今年度(R${targetYear - 2019})現況`}
            {currentFileName ? ` ／ ${currentFileName}` : ''} ／ {todayStr}
          </div>
        </div>

        <div className="mt-1.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 leading-snug">
          <div>
            <span className="text-slate-500">人員計画目標: </span>
            <b className="text-slate-900">
              現状{sim.startHeadcount}人 → {sim.goalYears}年後({formatSimEraYear(goalYearNum)})に{sim.goalHeadcount}人
            </b>
            <span className="ml-1 font-mono">
              ({totalDelta > 0 ? `+${totalDelta}` : totalDelta < 0 ? `▲${Math.abs(totalDelta)}` : '±0'}人)
            </span>
          </div>
          <div>
            <span className="text-slate-500">分析期間・減率(四捨五入): </span>
            <b className="text-slate-900">
              {sim.horizon}年間 ／ 60歳時短・離職減{age60DropPct}%・59歳以下中途減{midAttritionPct.toFixed(1)}%
            </b>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500">採用計画方式: </span>
            <b className="text-slate-900">{modeLabel}</b>
            <span className="text-slate-600"> ［臨任枠の扱い: {tempLabel}］</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRunningPageTitle = (subTitle) => (
    <div className="flex items-baseline justify-between border-b border-slate-400 pb-1 mb-2 text-[10px] text-slate-600">
      <span className="font-bold text-slate-800">
        採用計画・人員構成シミュレーション（{formatSimEraYear(targetYear)}年度案：{planName}）― {subTitle}
      </span>
      <span className="font-mono">
        目標: {sim.startHeadcount}人→{sim.goalYears}年後{sim.goalHeadcount}人 ／ {todayStr}
      </span>
    </div>
  );

  const mainUI = (
    <div
      ref={rootRef}
      className={
        portalBlocked
          ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center sim-root-wrapper'
          : 'min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 sim-root-wrapper'
      }
    >
      <div
        className={
          portalBlocked
            ? 'bg-slate-50 rounded-xl shadow-2xl w-[98vw] h-[96vh] max-w-[1840px] flex flex-col font-sans text-slate-900 overflow-hidden sim-inner-shell'
            : 'flex-1 flex flex-col w-full max-w-[1840px] mx-auto sim-inner-shell'
        }
      >
        {/* Screen Header */}
        <header className="bg-white border-b border-slate-300 shadow-sm shrink-0 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 sim-no-print">
          <div className="flex items-center gap-2.5 flex-wrap">
            <TrendingUp className="w-5 h-5 text-[#0072B2]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              採用計画・人員構成シミュレーター
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              対象案: {planName}
            </span>
            {currentFileName && (
              <span className="text-xs text-slate-500 hidden 2xl:inline">({currentFileName})</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">基準:</span>
              <select
                value={baseMode}
                onChange={(e) => setBaseMode(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800"
              >
                <option value="next">来年度(R{targetYear - 2018})配置案</option>
                <option value="current">今年度(R{targetYear - 2019})現況</option>
              </select>
            </label>

            {/* A4縦印刷・綴じ代設定グループ */}
            <div className="flex flex-wrap items-center bg-slate-100 border border-slate-300 rounded-md p-0.5 gap-1">
              <select
                value={printScope}
                onChange={(e) => setPrintScope(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-semibold text-slate-800"
                title="印刷する範囲を選択します（A4縦・上下2段レイアウト）"
              >
                <option value="all">A4縦 全項目一括（①〜④）</option>
                <option value="current">A4縦 表示中タブのみ</option>
              </select>
              <select
                value={bindingMode}
                onChange={(e) => setBindingMode(e.target.value)}
                className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-700"
                title="2穴パンチ・ファイル綴じ用の綴じ代余白を設定します"
              >
                <option value="left">綴じ代：左22mm（片面用）</option>
                <option value="duplex">綴じ代：見開き内側22mm（両面長辺）</option>
                <option value="top">綴じ代：上24mm（上綴じ用）</option>
              </select>
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                title="A4縦・綴じ代付きレイアウトで印刷またはPDF保存します"
              >
                <Printer className="w-3.5 h-3.5" /> 印刷 / PDF化
              </button>
            </div>

            <button
              type="button"
              onClick={() => exportSimulationCsv(sim, planName)}
              className="flex items-center gap-1 text-white px-2.5 py-1.5 rounded-md text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: CUD.blue }}
            >
              <Download className="w-3.5 h-3.5" /> CSV出力
            </button>

            {portalBlocked && (
              <button
                type="button"
                onClick={handlePopOutManually}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer"
                title="独立した別ウィンドウで開き直します"
              >
                <ExternalLink className="w-3.5 h-3.5" /> 別ウィンドウで開く
              </button>
            )}

            <button
              type="button"
              onClick={handleFullClose}
              className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" /> 閉じる
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sim-main-scroll">
          {/* ====== SCREEN VIEW (Hidden during Print) ====== */}
          <div className="space-y-4 sim-no-print">
            {/* Screen KPI Strip */}
            {renderKpiCards(false)}

            {/* Simulation Parameters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">シミュレーション条件設定</span>
                {hasCustomHires && (
                  <button
                    type="button"
                    onClick={() => setCustomHiresByYear({})}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded border border-slate-300 bg-slate-100 hover:bg-slate-200 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> 個別年度の手動採用数調整をリセット
                  </button>
                )}
              </div>

              {/* 現状〇人で●年後に▲人にする 設定バー */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5 font-bold text-slate-800">
                  <span>🎯 人員計画目標：</span>
                  <span>現状</span>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={startHeadcount}
                    onChange={(e) => setStartHeadcount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold"
                  />
                  <span>人で、</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={goalYears}
                    onChange={(e) => setGoalYears(Math.max(1, Math.min(30, Number(e.target.value) || 1)))}
                    className="w-14 bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold"
                  />
                  <span>年後</span>
                  <span className="font-normal text-slate-500">({formatSimEraYear(goalYearNum)}年度)</span>
                  <span>に</span>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={goalHeadcount}
                    onChange={(e) => setGoalHeadcount(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-right font-mono font-bold"
                  />
                  <span>人にする</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="font-mono font-bold"
                    style={{
                      color: totalDelta > 0 ? CUD.blueText : totalDelta < 0 ? CUD.vermilionText : '#64748b'
                    }}
                  >
                    {totalDelta > 0
                      ? `+${totalDelta}名増員（年平均 +${perYrDelta}名）`
                      : totalDelta < 0
                        ? `▲${Math.abs(totalDelta)}名減員（年平均 ▲${perYrDelta}名）`
                        : '現員維持（±0名）'}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyRecommended}
                    className="px-2.5 py-1 rounded-md text-white font-bold text-xs cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: CUD.blue }}
                    title="●年後に▲人を達成する推奨平準化採用数をスライダーに反映します"
                  >
                    推奨採用数を反映
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToActual}
                    className="px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 font-semibold text-xs cursor-pointer"
                    title="現状・目標人数を現在の案の在籍人数にリセットします"
                  >
                    現員({base.totalPlacedCount}名)に戻す
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">表示・分析期間</span>
                    <select
                      value={selectedHorizon}
                      onChange={(e) => setSelectedHorizon(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value={5}>5年間</option>
                      <option value={10}>10年間</option>
                      <option value={15}>15年間</option>
                      <option value={20}>20年間</option>
                      <option value={25}>25年間</option>
                      <option value={30}>30年間</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">採用計画モード</span>
                    <select
                      value={strategy}
                      onChange={(e) => setStrategy(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="level">平準化採用（毎年一定数）</option>
                      <option value="replace">単年度欠員補充（全員正職員採用・臨任なし）</option>
                    </select>
                  </div>
                  <div
                    className="flex items-center justify-between"
                    style={{ opacity: isLevel ? 1 : 0.45 }}
                    title="平準化採用時の臨任枠の扱いです。単年度欠員補充モードでは常に臨任を雇わず必要数全員を正職員で採用します"
                  >
                    <span className="text-slate-500">臨任枠の推計扱い</span>
                    <select
                      value={tempMode}
                      disabled={!isLevel}
                      onChange={(e) => setTempMode(e.target.value)}
                      className="bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="replace_temp">採用で正規職員へ置換（推奨）</option>
                      <option value="keep_temp">そのまま継続在籍とみなす</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5" style={{ opacity: isLevel ? 1 : 0.45 }}>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">
                        {sim.horizon > sim.goalYears
                          ? `年間採用数（1〜${sim.goalYears}年目：${sim.goalHeadcount}名到達まで）`
                          : `年間採用数（1〜${sim.goalYears}年目：平準化ベース）`}
                      </span>
                      <span className="font-mono font-bold">{baseAnnualHire}名/年</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="35"
                      step="1"
                      disabled={!isLevel}
                      value={baseAnnualHire}
                      onChange={(e) => setBaseAnnualHire(Number(e.target.value))}
                      className="w-full accent-[#0072B2]"
                    />
                  </div>

                  {sim.horizon > sim.goalYears && (
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">
                          目標到達後（{sim.goalYears + 1}〜{sim.horizon}年目）の維持採用数
                        </span>
                        <span className="font-mono font-bold">{postGoalAnnualHire}名/年</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="35"
                        step="1"
                        disabled={!isLevel}
                        value={postGoalAnnualHire}
                        onChange={(e) => setPostGoalAnnualHire(Number(e.target.value))}
                        className="w-full accent-[#0072B2]"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500" title="60歳役職定年時に早期退職や定年前再任用短時間勤務（他除外移行）で実質減少する割合（四捨五入）">
                        60歳到達時の離職・時短減率
                      </span>
                      <span className="font-mono">{age60DropPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      step="5"
                      value={age60DropPct}
                      onChange={(e) => setAge60DropPct(Number(e.target.value))}
                      className="w-full accent-[#0072B2]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500" title="59歳以下の自己都合退職など年間離職率（四捨五入）">
                        59歳以下の年間中途離職率
                      </span>
                      <span className="font-mono">{midAttritionPct.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.5"
                      value={midAttritionPct}
                      onChange={(e) => setMidAttritionPct(Number(e.target.value))}
                      className="w-full accent-[#0072B2]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Tabs Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-wrap border-b border-slate-200 bg-slate-100 px-3 gap-1">
                {[
                  { id: 'trend', label: '① 退職・役職定年と人員推移' },
                  { id: 'posts', label: '② 役職ポスト需給・担い手分析' },
                  { id: 'pyramid', label: '③ 将来年齢ピラミッド推移' },
                  { id: 'table', label: '④ 年度別採用計画表・CSV出力' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`px-3.5 py-2.5 text-xs transition-colors cursor-pointer border-b-2 ${
                      activeTab === t.id
                        ? 'border-[#0072B2] text-slate-900 font-bold bg-white/60'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'trend' && renderTrendSection('screen', false)}
                {activeTab === 'posts' && renderPostsSection('screen', false)}
                {activeTab === 'pyramid' && renderPyramidSection(false, 'screen', false)}
                {activeTab === 'table' && renderScreenTableSection()}
              </div>
            </div>
          </div>

          {/* ====== A4 PORTRAIT PRINT DOCUMENT (上下2段配置・綴じ代対応) ====== */}
          <div className="hidden sim-print-block">
            {printScope === 'all' ? (
              <>
                {/* A4縦 1ページ目：ヘッダー・前提・KPI ＋【上段】①-1 イベント棒グラフ ＋【下段】①-2 人員推移折れ線＆診断 */}
                <div>
                  {renderPrintReportHeader()}
                  {renderKpiCards(true)}
                  {renderTrendSection('print-all', true)}
                </div>

                {/* A4縦 2ページ目：【上段】② 役職ポスト需給分析 ＋【下段】③ 将来年齢ピラミッド3時点比較 */}
                <div className="sim-page-break">
                  {renderRunningPageTitle('役職ポスト需給・将来年齢ピラミッド')}
                  <div>{renderPostsSection('print-all', true)}</div>
                  <div className="border-t border-slate-300 pt-2.5 mt-2.5">
                    {renderPyramidSection(true, 'print-all', true)}
                  </div>
                </div>

                {/* A4縦 3ページ目：【上段】④-1 年度別採用計画数値表 ＋【下段】④-2 退職・役職定年対象者氏名一覧 */}
                <div className="sim-page-break">
                  {renderRunningPageTitle('年度別採用計画・対象者一覧')}
                  {renderPortraitPrintTables()}
                </div>
              </>
            ) : (
              /* 表示中のタブのみ A4縦印刷 */
              <div>
                {renderPrintReportHeader()}
                {renderKpiCards(true)}
                {activeTab === 'trend' && renderTrendSection('print-cur', true)}
                {activeTab === 'posts' && renderPostsSection('print-cur', true)}
                {activeTab === 'pyramid' && renderPyramidSection(false, 'print-cur', true)}
                {activeTab === 'table' && renderPortraitPrintTables()}
              </div>
            )}
          </div>
        </main>

        {/* Floating Tooltip */}
        {tooltip && (
          <div
            className="fixed pointer-events-none z-[100] max-w-[340px] p-2.5 rounded-lg bg-white border border-slate-300 shadow-xl text-xs text-slate-800 sim-no-print"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            {tooltip.content}
          </div>
        )}

        {/* Print Stylesheet (A4 Portrait + Binding Margin) */}
        <style>{`
          @media print {
            ${pageMarginCss}
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #app-header, #app-main, #app-floating-bar {
              display: none !important;
            }
            .sim-no-print {
              display: none !important;
            }
            .sim-print-block {
              display: block !important;
            }
            .sim-root-wrapper,
            .sim-inner-shell,
            .sim-main-scroll {
              position: static !important;
              width: 100% !important;
              max-width: none !important;
              height: auto !important;
              max-height: none !important;
              overflow: visible !important;
              background: #ffffff !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .sim-avoid-break {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .sim-page-break {
              break-before: page;
              page-break-before: always;
            }
            .sim-plan-table {
              font-size: 9.5px !important;
              line-height: 1.3 !important;
            }
            .sim-plan-table thead {
              display: table-header-group !important;
            }
            .sim-plan-table tr {
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .sim-plan-table th,
            .sim-plan-table td {
              padding: 3px 4.5px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );

  if (portalBlocked) {
    return mainUI;
  }

  return (
    <NewWindowPortal
      title={windowTitle}
      targetWindow={activeWinProp}
      onClose={handleFullClose}
      onBlocked={() => setPortalBlocked(true)}
    >
      {mainUI}
    </NewWindowPortal>
  );
};
