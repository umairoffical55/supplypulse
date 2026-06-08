// Built with Kiro - SupplyPulse v1.0

import { useState, useEffect, useRef } from 'react';

// Defined outside component so they are stable references (avoids missing-dep warnings)
const BASE_ALERTS = [
  { id: 1, borderColor: 'border-l-[#FF6B6B]', time: '2 min ago', text: 'Karachi port congestion - 3hr delay on container offloading', tag: 'Pakistan Textile to EU' },
  { id: 2, borderColor: 'border-l-[#F59E0B]', time: '11 min ago', text: 'Shanghai Yantian berth occupancy at 94%', tag: 'Electronics China to PK' },
  { id: 3, borderColor: 'border-l-[#F59E0B]', time: '34 min ago', text: 'Ukraine wheat export corridor blocked', tag: 'Food Commodities to PK' },
  { id: 4, borderColor: 'border-l-blue-500', time: '1 hr ago', text: 'Rotterdam labour strike 60% probability', tag: 'Pakistan Textile to EU' },
  { id: 5, borderColor: 'border-l-blue-500', time: '2 hr ago', text: 'AI forecast: monsoon may impact Karachi in 9 days', tag: 'AI Prediction Engine' },
];

const DEMO_MESSAGES = [
  'CRITICAL: Karachi Port gate closed unexpectedly',
  'ALERT: Container ship MV Zulfiquar delayed 6 hours',
  'WARNING: Port Qasim customs system down',
  'CRITICAL: Gwadar Port weather disruption detected',
  'ALERT: Lahore Dry Port capacity at 98%',
];

export default function App() {
  const [time, setTime] = useState(new Date());
  const [activeDisruptions, setActiveDisruptions] = useState(14);
  const [atRiskShipments, setAtRiskShipments] = useState(83);
  const [selectedRoute, setSelectedRoute] = useState(null);
  // Tracks seconds elapsed since the last KPI refresh
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  // Landing page visibility
  const [showLanding, setShowLanding] = useState(true);
  // Demo mode state
  const [demoMode, setDemoMode] = useState(false);
  // useRef so the cycling index doesn't cause extra re-renders
  const demoAlertIndexRef = useRef(0);
  // Stores timeout IDs for the AI prediction sequence so they can be cleared on unmount
  const aiTimeoutsRef = useRef([]);
  // AI prediction flow states
  const [aiLoading, setAiLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [aiReportOpen, setAiReportOpen] = useState(false);
  const [reportTimestamp, setReportTimestamp] = useState('');


  // --- Live clock: updates every second, also drives the "last updated" counter ---
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        setTime(new Date());
        setSecondsSinceUpdate(prev => prev + 1);
      } catch (err) {
        console.error('Clock update error:', err);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Active Disruptions KPI: updates every 4 seconds ---
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setActiveDisruptions(prev => {
          const change = Math.random() > 0.5 ? 1 : -1;
          const next = prev + change;
          return next >= 10 && next <= 20 ? next : prev;
        });
        setSecondsSinceUpdate(0);
      } catch (err) {
        console.error('Disruptions update error:', err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- At Risk Shipments KPI: updates every 4 seconds ---
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        setAtRiskShipments(prev => {
          const change = Math.random() > 0.5 ? 2 : -2;
          const next = prev + change;
          return next >= 70 && next <= 100 ? next : prev;
        });
        setSecondsSinceUpdate(0);
      } catch (err) {
        console.error('At-risk shipments update error:', err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // --- Safe time formatter with fallback ---
  const formattedTime = (() => {
    try {
      return time instanceof Date && !isNaN(time) ? time.toLocaleTimeString() : '--:--:--';
    } catch {
      return '--:--:--';
    }
  })();

  // --- Route data ---
  const routes = [
    { id: 1, emoji: '🧵', name: 'Pakistan Textile to EU', origin: 'Karachi', destination: 'Rotterdam', status: 'DISRUPTED', badgeColor: 'text-[#FF6B6B] bg-[#FF6B6B]/10' },
    { id: 2, emoji: '💻', name: 'Electronics China to PK', origin: 'Shanghai', destination: 'Karachi', status: 'DELAYED', badgeColor: 'text-[#F59E0B] bg-[#F59E0B]/10' },
    { id: 3, emoji: '💊', name: 'Pharma India to Gulf', origin: 'Mumbai', destination: 'Dubai', status: 'ON TIME', badgeColor: 'text-[#00D4AA] bg-[#00D4AA]/10' },
    { id: 4, emoji: '🌾', name: 'Food Commodities to PK', origin: 'Ukraine', destination: 'Karachi', status: 'CRITICAL', badgeColor: 'text-[#FF6B6B] bg-[#FF6B6B]/10' },
    { id: 5, emoji: '🔧', name: 'Auto Parts Japan to PK', origin: 'Osaka', destination: 'Karachi', status: 'ON TIME', badgeColor: 'text-[#00D4AA] bg-[#00D4AA]/10' },
  ];

  // --- Alert feed: state-driven so Demo Mode can prepend live alerts ---
  const [liveAlerts, setLiveAlerts] = useState(BASE_ALERTS);

  // --- Demo Mode cycling alert messages ---
  // (DEMO_MESSAGES is defined as a module-level constant above)

  // --- Demo Mode: add new alert every 3s, bump Active Disruptions every 5s ---
  useEffect(() => {
    if (!demoMode) {
      // Reset alerts to base when demo is turned off
      setLiveAlerts(BASE_ALERTS);
      return;
    }

    // New alert every 3 seconds
    const alertInterval = setInterval(() => {
      const idx = demoAlertIndexRef.current % DEMO_MESSAGES.length;
      const isRed = DEMO_MESSAGES[idx].startsWith('CRITICAL');
      const newAlert = {
        id: Date.now(),
        borderColor: isRed ? 'border-l-[#FF6B6B]' : 'border-l-[#F59E0B]',
        time: 'just now',
        text: DEMO_MESSAGES[idx],
        tag: 'DEMO',
        isNew: true,
      };
      demoAlertIndexRef.current += 1;
      setLiveAlerts(current => [newAlert, ...current.slice(0, 7)]);
    }, 3000);

    // Bump Active Disruptions every 5 seconds
    const disruptionInterval = setInterval(() => {
      setActiveDisruptions(prev => Math.min(prev + 1, 30));
      setSecondsSinceUpdate(0);
    }, 5000);

    return () => {
      clearInterval(alertInterval);
      clearInterval(disruptionInterval);
    };
  }, [demoMode]);

  // --- Disruption risk bar chart data ---
  const chartData = [
    { day: 'Mon', value: '40%', height: 'h-[40%]', isRed: false },
    { day: 'Tue', value: '55%', height: 'h-[55%]', isRed: false },
    { day: 'Wed', value: '60%', height: 'h-[60%]', isRed: false },
    { day: 'Thu', value: '80%', height: 'h-[80%]', isRed: true },
    { day: 'Fri', value: '90%', height: 'h-[90%]', isRed: true },
    { day: 'Sat', value: '95%', height: 'h-[95%]', isRed: true },
    { day: 'Sun', value: '85%', height: 'h-[85%]', isRed: true },
  ];

  // --- AI Prediction: loading sequence then show report ---
  // Cleanup any pending timeouts when the component unmounts
  useEffect(() => {
    return () => {
      aiTimeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  function runAiPrediction() {
    // Clear any previous pending timeouts
    aiTimeoutsRef.current.forEach(id => clearTimeout(id));
    aiTimeoutsRef.current = [];

    setLoadingStep(0);
    setAiLoading(true);

    // Reveal status lines one by one every 600ms
    const steps = [1, 2, 3];
    steps.forEach((step) => {
      const id = setTimeout(() => setLoadingStep(step), step * 600);
      aiTimeoutsRef.current.push(id);
    });

    // After 2.5s hide loader and open report
    const finalId = setTimeout(() => {
      setAiLoading(false);
      setReportTimestamp(new Date().toLocaleString());
      setAiReportOpen(true);
    }, 2500);
    aiTimeoutsRef.current.push(finalId);
  }

  function closeReport() {
    setAiReportOpen(false);
  }

  // ── LANDING PAGE ──
  if (showLanding) {
    return (
      <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col items-center justify-center font-sans antialiased px-6">
        <style>{`
          @keyframes landing-fade {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          .landing-fade { animation: landing-fade 0.7s ease both; }
          .landing-fade-1 { animation-delay: 0.1s; }
          .landing-fade-2 { animation-delay: 0.3s; }
          .landing-fade-3 { animation-delay: 0.55s; }
          .landing-fade-4 { animation-delay: 0.8s; }
        `}</style>

        {/* Logo pulse */}
        <div className="landing-fade landing-fade-1 flex items-center gap-3 mb-6">
          <span className="relative flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00D4AA]"></span>
          </span>
          <span className="text-sm font-mono text-[#00D4AA] tracking-widest uppercase">Live Intelligence Platform</span>
        </div>

        {/* Main heading */}
        <h1 className="landing-fade landing-fade-1 text-6xl md:text-7xl font-bold text-white tracking-tight text-center mb-4">
          SupplyPulse
        </h1>

        {/* Subheading */}
        <p className="landing-fade landing-fade-2 text-lg md:text-xl font-semibold text-center mb-12" style={{ color: '#00D4AA' }}>
          Real-Time Supply Chain Intelligence for Pakistan
        </p>

        {/* Feature boxes */}
        <div className="landing-fade landing-fade-3 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-12">
          {[
            { icon: '📡', text: '147 Routes Monitored' },
            { icon: '🤖', text: 'AI Disruption Prediction' },
            { icon: '🇵🇰', text: 'Pakistan Focused' },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex flex-col items-center gap-3 p-5 rounded-xl border border-gray-800 bg-[#111318]"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-semibold text-gray-300 text-center">{text}</span>
            </div>
          ))}
        </div>

        {/* Enter Dashboard button */}
        <button
          className="landing-fade landing-fade-4 px-10 py-4 rounded-xl text-base font-bold tracking-wider transition-all duration-200"
          style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.5)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,212,170,0.28)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,212,170,0.15)'; }}
          onClick={() => setShowLanding(false)}
        >
          Enter Dashboard →
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col font-sans select-none antialiased">

      {/* ── 1. TOP NAVBAR ── */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800 bg-[#0A0C10] sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4AA] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00D4AA]"></span>
          </span>
          <h1 className="text-xl font-bold tracking-wider text-white">SupplyPulse</h1>
        </div>
        {/* Live clock - updates every second */}
        <div className="flex items-center gap-3">
          {/* Demo Mode toggle */}
          <button
            onClick={() => setDemoMode(prev => !prev)}
            className="text-xs font-bold font-mono px-3 py-1.5 rounded border transition-all duration-200"
            style={demoMode
              ? { color: '#FF6B6B', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.4)' }
              : { color: '#6b7280', background: 'transparent', border: '1px solid #374151' }
            }
          >
            {demoMode ? '⏹ Demo ON' : '▶ Demo Mode'}
          </button>
          <div className="font-mono text-gray-400 bg-gray-900/50 px-3 py-1.5 rounded border border-gray-800 text-sm">
            {formattedTime}
          </div>
        </div>
      </nav>

      {/* ── LAST UPDATED BANNER ── */}
      <div className="flex items-center justify-end px-6 py-1.5 bg-[#0A0C10] border-b border-gray-800/50">
        <span className="text-[11px] text-gray-600 font-mono tracking-wide">
          Last updated:&nbsp;
          <span className={secondsSinceUpdate <= 1 ? 'text-[#00D4AA]' : 'text-gray-500'}>
            {secondsSinceUpdate === 0
              ? 'just now'
              : `${secondsSinceUpdate}s ago`}
          </span>
        </span>
      </div>

      {/* ── DEMO MODE BANNER ── */}
      {demoMode && (
        <div className="flex items-center justify-center gap-2 px-6 py-2 border-b border-red-900/60"
          style={{ background: 'rgba(255,107,107,0.08)' }}>
          <style>{`
            @keyframes demo-blink {
              0%, 100% { opacity: 1; }
              50%       { opacity: 0.3; }
            }
            .demo-blink { animation: demo-blink 1s ease-in-out infinite; }
          `}</style>
          <span className="demo-blink w-2 h-2 rounded-full bg-[#FF6B6B] inline-block"></span>
          <span className="text-xs font-bold font-mono tracking-widest" style={{ color: '#FF6B6B' }}>
            DEMO MODE ACTIVE — Simulating Live Disruption Event
          </span>
          <span className="demo-blink w-2 h-2 rounded-full bg-[#FF6B6B] inline-block"></span>
        </div>
      )}

      {/* ── 2. SCROLLING TICKER BAR ── */}
      <div className="bg-[#161920] border-b border-gray-800 py-2.5 overflow-hidden relative flex items-center">
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(100vw); }
            100% { transform: translateX(-100%); }
          }
          .animate-ticker { animation: marquee 28s linear infinite; }
        `}</style>
        <div className="animate-ticker whitespace-nowrap text-sm tracking-wide text-gray-300 font-medium">
          Karachi Port — 3hr delay on textile shipments
          <span className="text-[#FF6B6B] mx-4">|</span>
          Shanghai — Congestion +22%
          <span className="text-[#F59E0B] mx-4">|</span>
          Dubai Jebel Ali — Clearance normal
          <span className="text-[#00D4AA] mx-4">|</span>
          Rotterdam — Labour strike risk
          <span className="text-[#F59E0B] mx-4">|</span>
          Lahore Dry Port — Cold chain disruption
        </div>
      </div>

      {/* ── MAIN CONTAINER ── */}
      <div className="flex-1 p-6 space-y-6 max-w-[1600px] w-full mx-auto">

        {/* ── 3. FOUR KPI CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111318] border border-gray-800/80 p-5 rounded-xl shadow-lg">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Active Disruptions</p>
            {/* Updates every 4 seconds */}
            <p className="text-3xl font-bold text-[#FF6B6B] mt-2 font-mono">{activeDisruptions}</p>
          </div>
          <div className="bg-[#111318] border border-gray-800/80 p-5 rounded-xl shadow-lg">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">At Risk Shipments</p>
            {/* Updates every 4 seconds */}
            <p className="text-3xl font-bold text-[#F59E0B] mt-2 font-mono">{atRiskShipments}</p>
          </div>
          <div className="bg-[#111318] border border-gray-800/80 p-5 rounded-xl shadow-lg">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">On Time Rate</p>
            <p className="text-3xl font-bold text-[#00D4AA] mt-2 font-mono">74%</p>
          </div>
          <div className="bg-[#111318] border border-gray-800/80 p-5 rounded-xl shadow-lg">
            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Average Delay</p>
            <p className="text-3xl font-bold text-[#F59E0B] mt-2 font-mono">4.2h</p>
          </div>
        </div>

        {/* ── 4. MAIN TWO-COLUMN SECTION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Supply Chain Routes */}
            <div className="bg-[#111318]/40 border border-gray-800/60 p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-bold tracking-wide text-gray-200">Supply Chain Routes</h2>
              <div className="space-y-3">
                {routes.map((route) => (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route.id === selectedRoute ? null : route.id)}
                    className={`flex items-center justify-between p-4 bg-[#111318] rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedRoute === route.id
                        ? 'border-[#00D4AA] shadow-[0_0_12px_rgba(0,212,170,0.15)]'
                        : 'border-gray-800/70 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl bg-gray-800/50 p-2 rounded-lg">{route.emoji}</div>
                      <div>
                        <p className="font-bold text-gray-100 text-sm md:text-base">{route.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {route.origin} → {route.destination}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded tracking-wide ${route.badgeColor}`}>
                      {route.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Country Risk Tiles */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { flag: '🇵🇰', name: 'Pakistan', label: 'MEDIUM RISK', color: 'text-[#F59E0B] bg-[#F59E0B]/10' },
                { flag: '🇨🇳', name: 'China',    label: 'HIGH RISK',   color: 'text-[#FF6B6B] bg-[#FF6B6B]/10' },
                { flag: '🇦🇪', name: 'UAE',      label: 'LOW RISK',    color: 'text-[#00D4AA] bg-[#00D4AA]/10' },
                { flag: '🇮🇳', name: 'India',    label: 'LOW RISK',    color: 'text-[#00D4AA] bg-[#00D4AA]/10' },
              ].map(({ flag, name, label, color }) => (
                <div key={name} className="bg-[#111318] border border-gray-800/80 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{flag}</span>
                    <span className="text-sm font-semibold text-gray-300">{name}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${color}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Live Alert Feed */}
            <div className="bg-[#111318]/40 border border-gray-800/60 p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-wide text-gray-200">Live Alerts</h2>
                <span className="text-xs text-[#00D4AA] font-mono bg-[#00D4AA]/10 px-2 py-1 rounded">
                  {liveAlerts.length} active
                </span>
              </div>
              <div className="space-y-3">
                {liveAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 ${alert.borderColor} bg-[#111318] p-3 rounded-r-lg transition-all duration-300`}
                  >
                    <p className="text-xs text-gray-300 leading-snug">{alert.text}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-gray-500 font-mono">{alert.time}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded ${alert.tag === 'DEMO' ? 'text-[#FF6B6B] bg-[#FF6B6B]/10' : 'text-gray-500 bg-gray-800'}`}>
                        {alert.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Disruption Risk Chart */}
            <div className="bg-[#111318]/40 border border-gray-800/60 p-6 rounded-xl space-y-4">
              <h2 className="text-lg font-bold tracking-wide text-gray-200">Disruption Risk — This Week</h2>
              <div className="flex items-end gap-2 h-32">
                {chartData.map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-gray-500 font-mono">{bar.value}</span>
                    <div className="w-full flex items-end" style={{ height: '80px' }}>
                      <div
                        className={`w-full rounded-t-sm transition-all duration-500 ${bar.isRed ? 'bg-[#FF6B6B]/70' : 'bg-[#00D4AA]/70'}`}
                        style={{ height: bar.value }}
                      ></div>
                    </div>
                    <span className="text-[10px] text-gray-500">{bar.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Prediction Button — hidden while loading */}
            {!aiLoading && (
              <button
                onClick={runAiPrediction}
                className="w-full py-3.5 rounded-xl font-bold text-sm tracking-wider bg-gradient-to-r from-[#00D4AA]/20 to-[#00D4AA]/5 border border-[#00D4AA]/40 text-[#00D4AA] hover:from-[#00D4AA]/30 hover:border-[#00D4AA]/70 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🤖</span> Run AI Disruption Prediction
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── AI LOADING OVERLAY ── */}
      {aiLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="bg-[#111318] border border-gray-700 rounded-2xl p-10 flex flex-col items-center gap-6 w-full max-w-sm mx-4 shadow-2xl">
            {/* Spinning circle */}
            <style>{`
              @keyframes ai-spin {
                to { transform: rotate(360deg); }
              }
              .ai-spinner {
                width: 52px; height: 52px;
                border: 3px solid rgba(0,212,170,0.15);
                border-top-color: #00D4AA;
                border-radius: 50%;
                animation: ai-spin 0.9s linear infinite;
              }
            `}</style>
            <div className="ai-spinner"></div>

            {/* Main label */}
            <p className="text-white font-semibold text-center text-sm tracking-wide">
              Analyzing <span className="text-[#00D4AA] font-bold">147</span> supply chain nodes with AI...
            </p>

            {/* Sequential status lines */}
            <div className="w-full space-y-2">
              {[
                'Scanning Karachi Port data...',
                'Cross-referencing 23 weather patterns...',
                'Generating route alternatives...',
              ].map((line, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs font-mono transition-opacity duration-500"
                  style={{ opacity: loadingStep > i ? 1 : 0 }}
                >
                  <span className="text-[#00D4AA]">▶</span>
                  <span className="text-gray-300">{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── AI ANALYSIS REPORT MODAL ── */}
      {aiReportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={closeReport}
        >
          {/* Modal panel — stop clicks bubbling to backdrop */}
          <div
            className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ─ SECTION 1: Header ─ */}
            <div className="flex items-start justify-between p-6 border-b border-gray-800 sticky top-0 bg-[#111318] z-10">
              <div>
                <h3 className="text-xl font-bold text-white">AI Disruption Analysis Report</h3>
                <p className="text-xs text-gray-500 mt-1">Generated at {reportTimestamp}</p>
              </div>
              <button
                onClick={closeReport}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none ml-4 mt-0.5"
                aria-label="Close report"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">

              {/* ─ SECTION 2: Risk Score ─ */}
              <div className="space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Overall Risk Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-bold font-mono" style={{ color: '#FF6B6B' }}>87</span>
                  <span className="text-2xl text-gray-500 font-mono mb-1">/100</span>
                </div>
                {/* Risk bar */}
                <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: '87%', background: '#FF6B6B' }}
                  ></div>
                </div>
                <p className="text-sm font-bold tracking-wide" style={{ color: '#FF6B6B' }}>
                  CRITICAL — Immediate action required
                </p>
              </div>

              {/* ─ SECTION 3: Root Cause Analysis ─ */}
              <div className="space-y-3">
                <h4 className="text-base font-bold" style={{ color: '#00D4AA' }}>Root Cause Analysis</h4>
                <ul className="space-y-2">
                  {[
                    'Karachi Port congestion has increased 34% due to pre-Eid import surge',
                    'Shanghai Yantian terminal operating at 94% capacity causing booking freeze',
                    'Rotterdam labour union negotiations have 60% probability of strike next week',
                  ].map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white">
                      <span style={{ color: '#00D4AA' }} className="mt-0.5 shrink-0">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ─ SECTION 4: Alternative Routes ─ */}
              <div className="space-y-4">
                <h4 className="text-base font-bold" style={{ color: '#00D4AA' }}>Recommended Alternative Routes</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: 'Karachi to Port Qasim reroute',
                      badge: 'FASTEST',
                      badgeColor: '#00D4AA',
                      stats: [
                        { label: 'Time saving',      value: '6 hours' },
                        { label: 'Cost saving',      value: '$2,400' },
                        { label: 'Risk reduction',   value: '45%' },
                      ],
                    },
                    {
                      name: 'Air freight via Dubai',
                      badge: 'SAFEST',
                      badgeColor: '#F59E0B',
                      stats: [
                        { label: 'Time saving',      value: '2 days' },
                        { label: 'Cost saving',      value: '$800' },
                        { label: 'Risk reduction',   value: '78%' },
                      ],
                    },
                    {
                      name: 'Gwadar Port alternate',
                      badge: 'CHEAPEST',
                      badgeColor: '#60A5FA',
                      stats: [
                        { label: 'Cost saving',      value: '$4,100' },
                        { label: 'Time difference',  value: '+8 hours' },
                        { label: 'Risk reduction',   value: '52%' },
                      ],
                    },
                  ].map((card) => (
                    <div
                      key={card.name}
                      className="flex flex-col justify-between p-4 rounded-lg space-y-4"
                      style={{ background: '#0A0C10', border: '1px solid #00D4AA' }}
                    >
                      <div className="space-y-2">
                        {/* Badge */}
                        <span
                          className="text-[10px] font-bold font-mono px-2 py-0.5 rounded tracking-widest"
                          style={{ color: card.badgeColor, background: `${card.badgeColor}20` }}
                        >
                          {card.badge}
                        </span>
                        <p className="text-sm font-semibold text-white leading-snug">{card.name}</p>
                        {/* Stats */}
                        <div className="space-y-1 pt-1">
                          {card.stats.map(({ label, value }) => (
                            <div key={label} className="flex justify-between text-xs">
                              <span className="text-gray-500">{label}</span>
                              <span className="text-gray-200 font-mono">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={closeReport}
                        className="w-full py-2 rounded-lg text-xs font-bold tracking-wide transition-colors duration-200"
                        style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.4)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.25)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.15)'}
                      >
                        Select This Route
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─ SECTION 5: Recommended Action ─ */}
              <div className="space-y-3">
                <h4 className="text-base font-bold" style={{ color: '#00D4AA' }}>Recommended Action</h4>
                <p className="text-sm font-bold text-white leading-relaxed">
                  Immediately reroute 60% of textile shipments through Port Qasim and notify EU buyers of 18-hour adjusted delivery window.
                </p>
                {/* Warning box */}
                <div
                  className="p-4 rounded-lg border-l-4 text-sm text-yellow-300"
                  style={{ background: 'rgba(245,158,11,0.15)', borderLeftColor: '#F59E0B' }}
                >
                  ⚠️ Act within <span className="font-bold">4 hours</span> to avoid PKR 12M in demurrage charges.
                </div>
              </div>

            </div>{/* end scrollable body */}

            {/* ─ SECTION 6: Footer buttons ─ */}
            <div className="flex items-center justify-between p-6 border-t border-gray-800 sticky bottom-0 bg-[#111318]">
              <button
                onClick={closeReport}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-400 border border-gray-700 hover:border-gray-500 hover:text-white transition-all duration-200"
              >
                Close Report
              </button>
              <button
                onClick={closeReport}
                className="px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200"
                style={{ background: 'rgba(0,212,170,0.2)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.5)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,212,170,0.2)'}
              >
                📄 Export PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
