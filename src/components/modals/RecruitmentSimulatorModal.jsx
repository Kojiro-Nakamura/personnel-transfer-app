import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { X, TrendingUp, Download, Play, Pause, RotateCcw } from 'lucide-react';
import {
  extractSimBaseline,
  runRecruitmentSimulation,
  formatSimEraYear,
  exportSimulationCsv
} from '../../utils/recruitmentSimulator.js';

// CUD (Okabe-Ito) 色覚多様性配慮パレット（ライト背景用）
const CUD = {
  blue: '#0072B2',
  navy: '#005A9C',
  sky: '#56B4E9',
  vermilion: '#D55E00',
  vermilionStripe: '#FFAD75',
  vermilionText: '#C2410C',
  yellow: '#F0C808',
  yellowStroke: '#8A6500',
  yellowText: '#926000',
  blueText: '#0066A6',
  refLine: '#0F172A',
  refHalo: '#FFFFFF',
  segDivider: '#FFFFFF'
};

const SWATCH_VERMILION_STYLE = {
  background: 'repeating-linear-gradient(-45deg, #D55E00, #D55E00 3px, #FFAD75 3px, #FFAD75 5px)'
};

const SWATCH_SKY_STYLE = {
  background: 'repeating-linear-gradient(-45deg, #56B4E9, #56B4E9 3px, #BAE6FD 3px, #BAE6FD 5px)'
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

export const RecruitmentSimulatorModal = ({
  isOpen,
  onClose,
  employees,
  departments,
  targetYear,
  planName = '基本案',
  currentFileName = ''
}) => {
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [tooltip, setTooltip] = useState(null);

  // モーダル起動時または基準時点変更時に現在の案の人数と推奨採用数を初期反映
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
  }, [isOpen, baseMode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Escキーで閉じる
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

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

  const showFloatingTip = (e, content) => {
    const pad = 14;
    const maxW = 340;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + maxW > window.innerWidth - 12) x = e.clientX - maxW - pad;
    if (y + 180 > window.innerHeight - 12) y = Math.max(12, e.clientY - 170);
    setTooltip({ x: Math.max(12, x), y: Math.max(12, y), content });
  };

  const hideFloatingTip = () => setTooltip(null);

  if (!isOpen) return null;

  const isLevel = strategy === 'level';
  const isReplaceTemp = sim.tempMode === 'replace_temp';
  const futureYears = sim.yearly.slice(1);
  const sumRetire = futureYears.reduce((s, r) => s + r.retire65Count, 0);
  const maxRetireRow = futureYears.reduce((m, r) => (r.retire65Count > m.retire65Count ? r : m), futureYears[0] || { year: base.baseYear + 1, retire65Count: 0 });
  const sumYakushoku = futureYears.reduce((s, r) => s + r.yakushoku60Count, 0);
  const goalYearNum = base.baseYear + sim.goalYears;
  const totalDelta = sim.goalHeadcount - sim.startHeadcount;
  const perYrDelta = (Math.abs(totalDelta) / sim.goalYears).toFixed(1);
  const lowH = Math.floor(sim.recommendedAnnualHire);
  const highH = Math.ceil(sim.recommendedAnnualHire);
  const hasCustomHires = Object.keys(customHiresByYear).length > 0;

  // ====== Tab 1: Bar & Line Chart Geometries ======
  const renderTrendTab = () => {
    const rows = futureYears;
    const W = Math.max(760, rows.length * 60 + 74);
    const H = 246;
    const padL = 44;
    const padR = 20;
    const padT = 28;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const maxVal = Math.max(10, ...rows.map(r => Math.max(r.retire65Count, r.yakushoku60Count, r.hires))) + 2;
    const stepW = plotW / Math.max(1, rows.length);
    const barW = Math.min(15, Math.max(10.5, (stepW - 14) / 3));
    const barGap = barW * 1.15;

    // Line chart geometry
    const allRows = sim.yearly;
    const LW = Math.max(760, allRows.length * 52 + 86);
    const LH = 282;
    const lPadL = 50;
    const lPadR = 26;
    const lPadT = 28;
    const lPadB = 64;
    const lPlotW = LW - lPadL - lPadR;
    const lPlotH = LH - lPadT - lPadB;
    const plotBottom = lPadT + lPlotH;
    const yearLabelY = plotBottom + 18;
    const hireStripY = plotBottom + 25;
    const hireStripH = 24;

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
      <div className="space-y-5">
        {/* Upper Bar Chart */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-bold text-slate-800">年度別イベント人数（65歳定年退職等・60歳役職定年・正職員採用数）</div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#9A3412]" style={SWATCH_VERMILION_STYLE} />
                65歳定年退職等（斜線）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#8A6500]" style={{ backgroundColor: CUD.yellow }} />
                60歳役職定年（黄）
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm inline-block" style={{ backgroundColor: CUD.blue }} />
                計画採用数（青）
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: `${W}px`, maxHeight: '256px' }}>
              <defs>
                <pattern id="modal-bar-stripe-verm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
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
                    <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{val}</text>
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
                    className="cursor-pointer"
                    onMouseMove={(e) =>
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
                    onMouseLeave={hideFloatingTip}
                  >
                    <rect x={cx - stepW / 2} y={padT - 16} width={stepW} height={plotH + 16} fill="transparent" />
                    <rect x={cxRet - barW / 2} y={yTopRet} width={barW} height={hRet} rx="1.5" fill="url(#modal-bar-stripe-verm)" stroke={CUD.vermilion} strokeWidth="0.8" />
                    <rect x={cxYak - barW / 2} y={yTopYak} width={barW} height={hYak} rx="1.5" fill={CUD.yellow} stroke={CUD.yellowStroke} strokeWidth="0.9" />
                    <rect x={cxHir - barW / 2} y={yTopHir} width={barW} height={hHir} rx="1.5" fill={CUD.blue} />
                    <text x={cxRet} y={yTopRet - 4} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight={r.retire65Count > 0 ? '700' : '400'} fill={r.retire65Count > 0 ? CUD.vermilionText : '#64748b'} style={HALO_CARD_STYLE}>{r.retire65Count}</text>
                    <text x={cxYak} y={yTopYak - 4} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight={r.yakushoku60Count > 0 ? '700' : '400'} fill={r.yakushoku60Count > 0 ? CUD.yellowText : '#64748b'} style={HALO_CARD_STYLE}>{r.yakushoku60Count}</text>
                    <text x={cxHir} y={yTopHir - 4} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight={r.hires > 0 ? '700' : '400'} fill={r.hires > 0 ? CUD.blueText : '#64748b'} style={HALO_CARD_STYLE}>{r.hires}</text>
                    <text x={cx} y={H - 11} textAnchor="middle" fontSize="11" fontWeight={r.isGoalYear ? '700' : '400'} fill={r.isGoalYear ? CUD.blueText : '#64748b'}>
                      {shortEra}{r.isGoalYear ? '★' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Lower Line Chart + Bottom Margin Hire Strip */}
        <div className="border-t border-slate-200 pt-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="font-bold text-slate-800">正職員充足数（育代含）と「59歳以下・現役役職担い手層」の推移</div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <span className="font-bold" style={{ color: CUD.blue }}>●―</span>
                <span>{isReplaceTemp ? '正職員在籍数（育代含・臨任除く）' : '在籍総数（臨任・育代含）'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="font-bold" style={{ color: CUD.vermilion }}>◆--</span>
                <span>59歳以下（役職担い手・若手層）</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 border-t-2 border-dashed border-slate-500 inline-block" />
                <span>
                  {sim.startHeadcount === sim.goalHeadcount
                    ? `目標人員（${sim.goalHeadcount}名維持）`
                    : `段階目標（${sim.startHeadcount}名→${sim.goalYears}年後${sim.goalHeadcount}名）`}
                </span>
              </span>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${LW} ${LH}`} style={{ width: '100%', minWidth: `${LW}px`, maxHeight: '292px' }}>
              {[0, 1, 2, 3, 4].map(g => {
                const val = Math.round(minY + ((maxY - minY) / 4) * g);
                const y = yScale(val);
                return (
                  <g key={g}>
                    <line x1={lPadL} y1={y} x2={LW - lPadR} y2={y} stroke="#cbd5e1" strokeDasharray="3,3" />
                    <text x={lPadL - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b">{val}</text>
                  </g>
                );
              })}

              {/* 欄外下部：各年度の採用人数ストリップ */}
              <rect x="4" y={hireStripY} width={LW - 8} height={hireStripH} rx="4" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
              <text x={lPadL - 8} y={hireStripY + 16} textAnchor="end" fontSize="10" fontWeight="700" fill={CUD.blueText}>採用数</text>

              {/* 目標到達年縦ガイドと段階目標ライン */}
              <line x1={goalX} y1={lPadT - 8} x2={goalX} y2={plotBottom} stroke="#cbd5e1" strokeWidth="1.4" strokeDasharray="3,3" />
              <polyline fill="none" stroke="#64748b" strokeWidth="1.8" strokeDasharray="6,4" points={ptsTarget} />

              <polyline fill="none" stroke={CUD.blue} strokeWidth="2.8" points={ptsTotal} />
              <polyline fill="none" stroke={CUD.vermilion} strokeWidth="2.4" strokeDasharray="5,3" points={ptsUnder60} />

              {isReplaceTemp && base.tempCount > 0 && (
                <circle cx={xScale(0)} cy={yScale(base.totalPlacedCount)} r="5.5" fill="none" stroke={CUD.yellowStroke} strokeWidth="2.2" />
              )}

              {allRows.map((r, i) => {
                const x = xScale(i);
                const yTot = yScale(r.total);
                const yU60 = yScale(r.under60);
                const totNum = Math.round(r.total);
                const u60Num = Math.round(r.under60);
                const shortEra = `R${r.year - 2018}`;
                const dSize = 4.6;
                const diamondPts = `${x},${yU60 - dSize} ${x + dSize},${yU60} ${x},${yU60 + dSize} ${x - dSize},${yU60}`;
                const diff = totNum - r.yearTarget;

                return (
                  <g
                    key={r.year}
                    className="cursor-pointer"
                    onMouseMove={(e) =>
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
                    onMouseLeave={hideFloatingTip}
                  >
                    <circle cx={x} cy={yTot} r={r.isGoalYear ? '5.2' : '4.2'} fill={CUD.blue} stroke="#ffffff" strokeWidth="1.2" />
                    <polygon points={diamondPts} fill={CUD.vermilion} stroke="#ffffff" strokeWidth="1" />
                    <text x={x} y={yTot - 8} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight="700" fill={CUD.blueText} style={HALO_CARD_STYLE}>{totNum}</text>
                    <text x={x} y={yU60 + 15} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight="700" fill={CUD.vermilionText} style={HALO_CARD_STYLE}>{u60Num}</text>
                    <text x={x} y={yearLabelY} textAnchor="middle" fontSize="11" fontWeight={r.isGoalYear ? '700' : '400'} fill={r.isGoalYear ? CUD.blueText : '#64748b'}>
                      {shortEra}{r.isGoalYear ? '★' : ''}
                    </text>
                    <text x={x} y={hireStripY + 16} textAnchor="middle" fontSize="10.5" fontFamily="monospace" fontWeight={r.hires > 0 ? '700' : '400'} fill={r.hires > 0 ? CUD.blueText : '#64748b'}>
                      {r.hires}名
                    </text>
                    <rect x={x - 20} y={lPadT - 16} width="40" height={lPlotH + 66} fill="transparent" />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Diagnostic Box */}
          <div className="text-xs p-3 rounded-lg bg-slate-100 border border-slate-200 space-y-1 text-slate-700">
            {sim.strategy === 'replace' ? (
              <>
                <div className="font-bold text-slate-900">
                  💡 シミュレーション診断ポイント（単年度欠員補充：現状{sim.startHeadcount}名 → {sim.goalYears}年後{sim.goalHeadcount}名）
                </div>
                <div>
                  ・段階目標ライン（現状{sim.startHeadcount}名 → <b>{formatSimEraYear(goalRow.year)}年度に{sim.goalHeadcount}名</b>）に沿って、臨任を使わず毎年必要数全員を正職員で採用します（初年度採用: <b>{y1.hires}名</b>）。
                </div>
                <div>
                  ・期間中の年間正職員採用数は <b>最小 {minHireRow.hires}名（{formatSimEraYear(minHireRow.year)}）〜 最大 {maxHireRow.hires}名（{formatSimEraYear(maxHireRow.year)}）</b> となります。
                </div>
                <div>
                  ・60〜64歳（役職定年層）は <b>{formatSimEraYear(peak60Row.year)}年度</b> に最大 <b>{Math.round(peak60Row.age60to64)}名</b>、59歳以下現役層は <b>{formatSimEraYear(minUnder60Row.year)}年度に最小 {Math.round(minUnder60Row.under60)}名</b> となります。
                </div>
              </>
            ) : (
              <>
                <div className="font-bold text-slate-900">
                  💡 シミュレーション診断ポイント（平準化採用：現状{sim.startHeadcount}名 → {sim.goalYears}年後{sim.goalHeadcount}名）
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
  const renderPostsTab = () => {
    const leaderPosts = Math.max(1, base.leaderPosts || 1);
    const ratios = sim.yearly.map(r => ({ year: r.year, ratio: r.age45to59 / leaderPosts }));
    const minRatioObj = ratios.reduce((m, x) => (x.ratio < m.ratio ? x : m), ratios[0]);

    const rows = sim.yearly;
    const W = Math.max(760, rows.length * 50 + 96);
    const H = 286;
    const padL = 42;
    const padR = 54;
    const padT = 26;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const maxVal = Math.max(...rows.map(r => r.total), leaderPosts * 1.4, 20) * 1.12;
    const yScale = v => padT + plotH - (v / maxVal) * plotH;
    const stepW = plotW / Math.max(1, rows.length);
    const barW = Math.min(25, Math.max(15, stepW * 0.54));
    const leaderY = yScale(base.leaderPosts);

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-slate-500">現在の課長級以上ポスト数</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{base.upperPosts}枠</div>
            <div className="text-slate-500 mt-0.5">部長・次長・所属長・課長級</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-slate-500">現在の班長級以上ポスト総数</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">{base.leaderPosts}枠</div>
            <div className="text-slate-500 mt-0.5">課長級以上＋補佐級III・II</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
            <div className="text-slate-500">期間中の最低「管理監督職カバー倍率」</div>
            <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {minRatioObj.ratio.toFixed(2)}倍 ({formatSimEraYear(minRatioObj.year)})
            </div>
            <div className="text-slate-500 mt-0.5">45〜59歳人数 ÷ 班長級以上枠数</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-bold text-slate-800">世代別構成の推移 vs 班長級以上ポスト枠（下から積上げ）</div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-sm inline-block" style={{ backgroundColor: CUD.navy }} />45-59歳(濃青)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#0284C7]" style={{ backgroundColor: CUD.sky }} />35-44歳(水色)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#8A6500]" style={{ backgroundColor: CUD.yellow }} />34歳以下(黄)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#9A3412]" style={SWATCH_VERMILION_STYLE} />60-64歳(朱斜線)
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: `${W}px`, maxHeight: '296px' }}>
            <defs>
              <pattern id="modal-post-stripe-verm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
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
                  <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10.5" fill="#64748b">{val}</text>
                </g>
              );
            })}

            {rows.map((r, i) => {
              const cx = padL + stepW * (i + 0.5);
              const segs = [
                { key: '45-59', val: r.age45to59, fill: CUD.navy, stroke: '#ffffff', txtFill: '#FFFFFF', halo: HALO_DARK_STYLE },
                { key: '35-44', val: r.age35to44, fill: CUD.sky, stroke: '#ffffff', txtFill: '#0F172A', halo: HALO_LIGHT_STYLE },
                { key: 'u35', val: r.under35, fill: CUD.yellow, stroke: '#ffffff', txtFill: '#0F172A', halo: HALO_LIGHT_STYLE },
                { key: '60-64', val: r.age60to64, fill: 'url(#modal-post-stripe-verm)', stroke: CUD.vermilion, txtFill: '#0F172A', halo: HALO_LIGHT_STYLE }
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
                  if (h >= 9.5 || prevCenterY === null || prevCenterY - cy >= 9.5) {
                    labelEls.push(
                      <text key={`lbl-${sg.key}`} x={cx} y={cy} textAnchor="middle" fontSize="8.8" fontFamily="monospace" fontWeight="700" fill={sg.txtFill} style={{ pointerEvents: 'none', ...sg.halo }}>
                        {rounded}
                      </text>
                    );
                    prevCenterY = cy;
                  } else {
                    labelEls.push(
                      <text key={`lbl-${sg.key}`} x={cx + barW / 2 + 5} y={cy} textAnchor="start" fontSize="8" fontFamily="monospace" fontWeight="700" fill="#0f172a" style={{ pointerEvents: 'none', ...HALO_CARD_STYLE }}>
                        {rounded}
                      </text>
                    );
                  }
                }
                acc += sg.val;
              });

              const totRounded = Math.round(r.total);
              const totLabelY = prevCenterY !== null ? Math.min(topBarY - 4, prevCenterY - 10) : topBarY - 4;
              const cov = (r.age45to59 / leaderPosts).toFixed(2);

              return (
                <g
                  key={r.year}
                  className="cursor-pointer"
                  onMouseMove={(e) =>
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
                  onMouseLeave={hideFloatingTip}
                >
                  <rect x={cx - stepW / 2} y={padT - 14} width={stepW} height={plotH + 14} fill="transparent" />
                  {rectEls}
                  {labelEls}
                  <text x={cx} y={totLabelY} textAnchor="middle" fontSize="9" fontFamily="monospace" fontWeight="700" fill="#0f172a" style={{ pointerEvents: 'none', ...HALO_CARD_STYLE }}>
                    {totRounded}
                  </text>
                  <text x={cx} y={H - 11} textAnchor="middle" fontSize="11" fill="#64748b">R{r.year - 2018}</text>
                </g>
              );
            })}

            {base.leaderPosts > 0 && (
              <g style={{ pointerEvents: 'none' }}>
                <line x1={padL} y1={leaderY} x2={W - padR} y2={leaderY} stroke={CUD.refHalo} strokeWidth="4.2" />
                <line x1={padL} y1={leaderY} x2={W - padR} y2={leaderY} stroke={CUD.refLine} strokeWidth="2" strokeDasharray="6,4" />
                <text x={W - padR + 4} y={leaderY - 2} textAnchor="start" fontSize="9" fontWeight="bold" fill={CUD.refLine}>◀ポスト</text>
                <text x={W - padR + 4} y={leaderY + 9} textAnchor="start" fontSize="9.5" fontFamily="monospace" fontWeight="bold" fill={CUD.refLine}>
                  {base.leaderPosts}枠
                </text>
              </g>
            )}
          </svg>
        </div>

        <div className="text-xs p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700">
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

  // ====== Tab 3: Age Pyramid ======
  const renderPyramidTab = () => {
    const safeIdx = Math.min(sim.yearly.length - 1, pyramidIdx);
    const snap = sim.yearly[safeIdx];
    const maxBin = Math.max(8, ...sim.yearly.flatMap(yr => Object.values(yr.ageBins).map(b => b.existing + b.hired)));
    const scaleMax = maxBin * 1.16;

    const ages = [];
    for (let a = 64; a >= 22; a--) ages.push(a);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <button
              type="button"
              onClick={() => setIsPlaying(p => !p)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer"
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
          </div>
          <div className="flex items-center gap-3 font-mono">
            <span className="font-bold text-sm text-slate-900">{formatSimEraYear(snap.year)}年度</span>
            <span className="text-slate-600">
              正職員 {Math.round(snap.total)}名（59歳以下 {Math.round(snap.under60)}名 / 60-64歳 {Math.round(snap.age60to64)}名）
              {snap.isBase && isReplaceTemp && base.tempCount > 0 ? ` ＋ 現臨任${base.tempCount}名（計${base.totalPlacedCount}名）` : ''}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm inline-block" style={{ backgroundColor: CUD.navy }} />
            現職コーホート（59歳以下・濃青）
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#0284C7]" style={SWATCH_SKY_STYLE} />
            今後の新規採用累積（水色斜線）
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-sm inline-block border border-[#9A3412]" style={SWATCH_VERMILION_STYLE} />
            60〜64歳 役職定年層（朱斜線）
          </span>
        </div>

        <div className="space-y-0.5">
          {ages.map(age => {
            const bin = snap.ageBins[age] || { existing: 0, hired: 0 };
            const exPct = (bin.existing / scaleMax) * 100;
            const hiPct = (bin.hired / scaleMax) * 100;
            const tot = bin.existing + bin.hired;
            const hasBoth = bin.existing >= 0.05 && bin.hired >= 0.05;

            let tipText = fmtCompactInt(tot);
            if (hasBoth && (exPct < 5.5 || hiPct < 5.5)) {
              tipText = `${fmtCompactInt(tot)} (現${fmtCompactInt(bin.existing)}+新${fmtCompactInt(bin.hired)})`;
            }

            return (
              <div
                key={age}
                className="flex items-center gap-2"
                style={age === 59 ? { borderTop: `2px dashed ${CUD.vermilion}`, paddingTop: '4px', marginTop: '4px' } : undefined}
              >
                <div className="w-10 text-right text-slate-500 font-mono text-[11px] leading-none">{age}歳</div>
                <div className="flex-1 h-3.5 bg-slate-100 rounded overflow-hidden flex items-center">
                  <div
                    className="h-full flex items-center justify-center overflow-hidden"
                    style={
                      age >= 60
                        ? { width: `${exPct}%`, border: `1px solid ${CUD.vermilion}`, ...SWATCH_VERMILION_STYLE }
                        : { width: `${exPct}%`, backgroundColor: CUD.navy }
                    }
                  >
                    {hasBoth && exPct >= 5.5 && (
                      <span
                        className="font-mono font-bold leading-none"
                        style={{
                          fontSize: '8.5px',
                          color: age >= 60 ? '#0F172A' : '#FFFFFF',
                          textShadow: age >= 60 ? '0 0 3px #fff' : '0 0 2px #002b4d'
                        }}
                      >
                        {fmtCompactInt(bin.existing)}
                      </span>
                    )}
                  </div>
                  <div
                    className="h-full flex items-center justify-center overflow-hidden"
                    style={{
                      width: `${hiPct}%`,
                      ...(hiPct > 0 ? SWATCH_SKY_STYLE : {}),
                      ...(hiPct > 0 && exPct > 0 ? { borderLeft: '1px solid #ffffff' } : {})
                    }}
                  >
                    {hasBoth && hiPct >= 5.5 && (
                      <span
                        className="font-mono font-bold leading-none text-slate-900"
                        style={{ fontSize: '8.5px', textShadow: '0 0 3px #fff' }}
                      >
                        {fmtCompactInt(bin.hired)}
                      </span>
                    )}
                  </div>
                  <span
                    className="ml-1.5 font-mono leading-none whitespace-nowrap"
                    style={{
                      fontSize: '9.5px',
                      fontWeight: tot >= 0.05 ? 700 : 400,
                      color: tot >= 0.05 ? '#0f172a' : '#94a3b8'
                    }}
                  >
                    {tipText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ====== Tab 4: Detailed Table ======
  const renderTableTab = () => (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <p className="text-slate-500">
          各年度の「計画採用数」を直接変更して個別計画を試算できます。退職・役職定年欄にカーソルを合わせると対象者氏名を表示します。
        </p>
        <button
          type="button"
          onClick={() => exportSimulationCsv(sim, planName)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white font-bold text-xs cursor-pointer hover:opacity-90"
          style={{ backgroundColor: CUD.blue }}
        >
          <Download className="w-3.5 h-3.5" /> CSVダウンロード
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-300 rounded-lg">
        <table className="w-full text-xs border-collapse bg-white">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-slate-600">
              <th className="py-2 px-2.5 text-left font-bold">年度</th>
              <th className="py-2 px-2.5 text-right font-bold">前年度末</th>
              <th className="py-2 px-2.5 text-right font-bold" style={{ color: CUD.vermilionText }}>65歳退職等</th>
              <th className="py-2 px-2.5 text-right font-bold" style={{ color: CUD.yellowText }}>60歳役職定年</th>
              <th className="py-2 px-2.5 text-right font-bold">時短・中途減</th>
              <th className="py-2 px-2.5 text-center font-bold">計画採用数(正職員)</th>
              <th className="py-2 px-2.5 text-right font-bold text-slate-900">
                {isReplaceTemp ? '正職員数(育代含)' : '在籍総数(臨任・育代含)'}
              </th>
              <th className="py-2 px-2.5 text-right font-bold">うち59歳以下</th>
              <th className="py-2 px-2.5 text-right font-bold">うち60-64歳</th>
              <th className="py-2 px-2.5 text-right font-bold">年度目標</th>
              <th className="py-2 px-2.5 text-right font-bold">
                {sim.strategy === 'replace' ? '目標比過不足(臨任なし)' : '目標比過不足(▲要臨任)'}
              </th>
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
                  <td className="py-2 px-2.5 font-semibold text-slate-800">
                    {formatSimEraYear(r.year)}
                    {r.isBase && <span className="text-slate-400 font-normal ml-1">(基準)</span>}
                    {r.isGoalYear && <span className="font-bold ml-1" style={{ color: CUD.blueText }}>★目標年</span>}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono">{r.isBase ? '-' : Math.round(r.prevTotal)}</td>
                  <td
                    className="py-2 px-2.5 text-right font-mono cursor-help"
                    style={{ color: CUD.vermilionText }}
                    title={r.retire65Names.length ? `65歳定年退職等: ${r.retire65Names.join('、')}` : undefined}
                  >
                    {r.isBase ? '-' : r.retire65Count > 0 ? `▲${r.retire65Count}` : '0'}
                  </td>
                  <td
                    className="py-2 px-2.5 text-right font-mono cursor-help"
                    style={{ color: CUD.yellowText }}
                    title={r.yakushoku60Names.length ? `60歳役職定年: ${r.yakushoku60Names.join('、')}` : undefined}
                  >
                    {r.yakushoku60Count}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono text-slate-500">
                    {r.isBase ? '-' : r.attritionLoss > 0 ? `▲${Math.round(r.attritionLoss)}` : '0'}
                  </td>
                  <td className="py-1.5 px-2.5 text-center">
                    {r.isBase ? (
                      <span className="text-slate-400 font-mono">{r.hires}</span>
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
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                    {Math.round(r.total)}
                    {r.isBase && isReplaceTemp && base.tempCount > 0 && (
                      <span className="font-normal text-slate-400 ml-1">(臨含{base.totalPlacedCount})</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono">{Math.round(r.under60)}</td>
                  <td className="py-2 px-2.5 text-right font-mono">{Math.round(r.age60to64)}</td>
                  <td className="py-2 px-2.5 text-right font-mono text-slate-500">{r.yearTarget}</td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold" style={{ color: diffColor }}>
                    {diffDisp}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-xl shadow-2xl w-[98vw] h-[96vh] max-w-[1800px] flex flex-col font-sans text-slate-900 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <header className="bg-white border-b border-slate-300 shadow-sm shrink-0 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <TrendingUp className="w-5 h-5 text-[#0072B2]" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              採用計画・人員構成シミュレーター
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
              対象案: {planName}
            </span>
            {currentFileName && (
              <span className="text-xs text-slate-500 hidden md:inline">({currentFileName})</span>
            )}
            <span className="text-xs px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600">
              60歳役職定年・65歳定年 ／ 臨任・育代含（他除外除く）
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <label className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">基準時点:</span>
              <select
                value={baseMode}
                onChange={(e) => setBaseMode(e.target.value)}
                className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs font-semibold text-slate-800"
              >
                <option value="next">来年度(R{targetYear - 2018})配置案ベース</option>
                <option value="current">今年度(R{targetYear - 2019})現況ベース</option>
              </select>
            </label>

            <button
              type="button"
              onClick={() => exportSimulationCsv(sim, planName)}
              className="flex items-center gap-1 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-opacity hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: CUD.blue }}
            >
              <Download className="w-3.5 h-3.5" /> CSV出力
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" /> 閉じる
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-xs text-slate-500">
                {formatSimEraYear(base.baseYear)} 正規在籍人員（臨任・育代含）
              </div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1 text-slate-900">
                {base.totalPlacedCount}名
              </div>
              <div className="text-xs text-slate-500 mt-1">
                実正規(育代{base.ikudaiCount}含) {base.nonTempCount}名 ＋ 臨任 {base.tempCount}名 ※他除外{base.excludedCount}名除く
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-xs text-slate-500">今後{sim.horizon}年間の65歳定年退職等</div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1" style={{ color: CUD.vermilionText }}>
                計 {sumRetire}名
              </div>
              <div className="text-xs text-slate-500 mt-1">
                年平均 {(sumRetire / sim.horizon).toFixed(1)}名（最大 {formatSimEraYear(maxRetireRow.year)} {maxRetireRow.retire65Count}名）
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-xs text-slate-500">今後{sim.horizon}年間の60歳役職定年</div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1" style={{ color: CUD.yellowText }}>
                計 {sumYakushoku}名
              </div>
              <div className="text-xs text-slate-500 mt-1">
                年平均 {(sumYakushoku / sim.horizon).toFixed(1)}名が役職ポストから離脱
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
              <div className="text-xs text-slate-500">
                {sim.goalYears}年後(R{goalYearNum - 2018}) {sim.goalHeadcount}名達成の理論平準化採用数
              </div>
              <div className="text-xl font-bold font-mono tabular-nums mt-1" style={{ color: CUD.blueText }}>
                {sim.recommendedAnnualHire.toFixed(1)}名/年
              </div>
              <div className="text-xs text-slate-500 mt-1">
                1〜{sim.goalYears}年目目安: {lowH === highH ? lowH : `${lowH}〜${highH}`}名/年
                {sim.horizon > sim.goalYears
                  ? ` ／ 到達後維持: 約${sim.postGoalRecommendedHire.toFixed(1)}名/年`
                  : isReplaceTemp && base.tempCount > 0
                    ? `（現臨任${base.tempCount}名の正職員化含）`
                    : ''}
              </div>
            </div>
          </div>

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

          {/* Main Tabs Card */}
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
              {activeTab === 'trend' && renderTrendTab()}
              {activeTab === 'posts' && renderPostsTab()}
              {activeTab === 'pyramid' && renderPyramidTab()}
              {activeTab === 'table' && renderTableTab()}
            </div>
          </div>
        </main>

        {/* Floating Tooltip */}
        {tooltip && (
          <div
            className="fixed pointer-events-none z-[100] max-w-[340px] p-2.5 rounded-lg bg-white border border-slate-300 shadow-xl text-xs text-slate-800"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            {tooltip.content}
          </div>
        )}
      </div>
    </div>
  );
};
