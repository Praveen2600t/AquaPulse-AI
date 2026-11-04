import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { WaterIntelligencePage } from './pages/WaterIntelligencePage';
import { ComponentHealthPage } from './pages/ComponentHealthPage';
import { DiagnosticsPage } from './pages/DiagnosticsPage';
import { PredictiveMaintenancePage } from './pages/PredictiveMaintenancePage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { MaintenanceCentrePage } from './pages/MaintenanceCentrePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  api,
  SystemOverview,
  SensorReading,
  generateLocalFallbackOverview,
} from './services/api';
import {
  LayoutDashboard,
  Box,
  Droplets,
  HeartPulse,
  Cpu,
  TrendingUp,
  FlaskConical,
  Wrench,
  FileText,
  Settings,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [overview, setOverview] = useState<SystemOverview>(generateLocalFallbackOverview());
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [currentMode, setCurrentMode] = useState<string>('NORMAL');

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ovData, histData] = await Promise.all([
          api.getSystemOverview(),
          api.getTelemetryHistory(60),
        ]);
        setOverview(ovData);
        setHistory(histData);
        setCurrentMode(ovData.current_operating_mode || 'NORMAL');
      } catch (err) {
        console.warn('Initial load fallback:', err);
      }
    };
    fetchData();

    // Setup periodic polling interval (every 3 seconds) for live telemetric realism
    const interval = setInterval(async () => {
      try {
        const ov = await api.getSystemOverview();
        setOverview(ov);
        setHistory((prev) => {
          const updated = [...prev, ov.latest_reading];
          return updated.length > 60 ? updated.slice(updated.length - 60) : updated;
        });
      } catch {
        // keep current state
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleModeChange = async (newMode: string) => {
    setCurrentMode(newMode);
    await api.setSimulationMode(newMode);
    // Refresh overview immediately
    const updated = await api.getSystemOverview();
    setOverview(updated);
  };

  const handleSelectComponent = (id: string | null) => {
    setSelectedComponentId(id);
  };

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Navbar
        currentMode={currentMode}
        onModeChange={handleModeChange}
        overallHealth={overview.overall_health}
        activeAlertsCount={overview.active_alerts_count}
      />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          activeAlertsCount={overview.active_alerts_count}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 lg:pb-8">
          {activeTab === 'overview' && (
            <OverviewDashboard
              overview={overview}
              history={history}
              onNavigateTab={setActiveTab}
              onSelectComponent={handleSelectComponent}
            />
          )}

          {activeTab === 'twin' && (
            <DigitalTwinPage
              components={overview.components}
              sensorReading={overview.latest_reading}
              selectedComponentId={selectedComponentId}
              onSelectComponent={handleSelectComponent}
            />
          )}

          {activeTab === 'water' && (
            <WaterIntelligencePage
              reading={overview.latest_reading}
              history={history}
            />
          )}

          {activeTab === 'health' && (
            <ComponentHealthPage
              components={overview.components}
              sensorReading={overview.latest_reading}
              onSelectComponent={handleSelectComponent}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'diagnostics' && (
            <DiagnosticsPage
              faults={overview.active_faults}
              sensorReading={overview.latest_reading}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictiveMaintenancePage
              rulPredictions={overview.rul_predictions}
              components={overview.components}
            />
          )}

          {activeTab === 'simulator' && <WhatIfSimulatorPage />}

          {activeTab === 'maintenance' && <MaintenanceCentrePage />}

          {activeTab === 'reports' && <ReportsPage overview={overview} />}

          {activeTab === 'settings' && (
            <SettingsPage
              currentMode={currentMode}
              onModeChange={handleModeChange}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold ${
            activeTab === 'overview' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button
          onClick={() => setActiveTab('twin')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold ${
            activeTab === 'twin' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Box className="w-4 h-4" />
          <span>3D Twin</span>
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold ${
            activeTab === 'water' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Water</span>
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold ${
            activeTab === 'health' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>Health</span>
        </button>
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold relative ${
            activeTab === 'diagnostics' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI</span>
          {overview.active_alerts_count > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-bold ${
            activeTab === 'simulator' ? 'text-cyan-400' : 'text-slate-400'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Sim</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
