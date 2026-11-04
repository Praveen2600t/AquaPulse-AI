import React from 'react';
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
  ChevronRight
} from 'lucide-react';

export type NavTab =
  | 'overview'
  | 'twin'
  | 'water'
  | 'health'
  | 'diagnostics'
  | 'predictions'
  | 'simulator'
  | 'maintenance'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeAlertsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  activeAlertsCount,
}) => {
  const menuItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard, badge: null },
    { id: 'twin' as NavTab, label: '3D Digital Twin', icon: Box, badge: 'Interactive' },
    { id: 'water' as NavTab, label: 'Water Intelligence', icon: Droplets, badge: null },
    { id: 'health' as NavTab, label: 'Component Health', icon: HeartPulse, badge: null },
    { id: 'diagnostics' as NavTab, label: 'AI Fault Diagnostics', icon: Cpu, badge: activeAlertsCount > 0 ? `${activeAlertsCount}` : null, isAlert: activeAlertsCount > 0 },
    { id: 'predictions' as NavTab, label: 'Predictive RUL', icon: TrendingUp, badge: null },
    { id: 'simulator' as NavTab, label: 'What-If Simulator', icon: FlaskConical, badge: 'Physics' },
    { id: 'maintenance' as NavTab, label: 'Maintenance Centre', icon: Wrench, badge: null },
    { id: 'reports' as NavTab, label: 'Audit & Reports', icon: FileText, badge: 'PDF' },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col border-r border-cyan-500/15 bg-slate-950/70 backdrop-blur-xl p-4 justify-between h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation & Controls
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      item.isAlert
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Institution & Team Footer */}
      <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">AquaPulse AI • SRIT</p>
        <p className="text-[10px] text-slate-400">Team: NEXTGEN AI</p>
        <p className="text-[10px] text-cyan-400">Praveen K & Prithika C</p>
      </div>
    </aside>
  );
};
