import React, { useState, useEffect } from 'react';
import { MaintenanceItem, api } from '../services/api';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  Plus,
  BookOpen,
  FileCheck,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const MaintenanceCentrePage: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceItem[]>([]);
  const [diyGuides, setDiyGuides] = useState<any[]>([]);
  const [checklist, setChecklist] = useState<any[]>([]);
  const [activeGuideId, setActiveGuideId] = useState<string>('sediment_diy');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Form State
  const [compName, setCompName] = useState<string>('Sediment Filter (5 Micron)');
  const [actionDesc, setActionDesc] = useState<string>('Replaced spun polypropylene filter candle');
  const [techName, setTechName] = useState<string>('Praveen K');
  const [notesText, setNotesText] = useState<string>('Scheduled routine maintenance replacement');

  useEffect(() => {
    api.getMaintenanceLogs().then(setLogs);
    api.getDiyGuides().then((guides) => {
      setDiyGuides(guides);
      if (guides.length > 0) setActiveGuideId(guides[0].id);
    });
    api.getChecklist().then(setChecklist);
  }, []);

  const handleCreateLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = await api.addMaintenanceLog({
      component: compName,
      action: actionDesc,
      technician: techName,
      notes: notesText,
      liters_at_service: 14820.0,
      cost: 20.0,
    });
    setLogs([newRecord, ...logs]);
    setShowAddModal(false);
  };

  const selectedGuide = diyGuides.find((g) => g.id === activeGuideId) || diyGuides[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              MAINTENANCE CENTRE &amp; SERVICE MANUAL
            </span>
            <span className="text-xs text-slate-400 font-mono">DIY Guides &amp; Service History</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            Maintenance Records &amp; Field Instructions
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete service history audit, step-by-step DIY replacement guides, and interactive preventative checklists.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Service Action
        </button>
      </div>

      {/* DIY Step-by-Step Replacement Guides */}
      <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              DIY Component Replacement Manual
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Illustrated step-by-step technician instructions for safe filter housing servicing.
            </p>
          </div>

          {/* Guide Selector Tabs */}
          <div className="flex items-center gap-2">
            {diyGuides.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGuideId(g.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeGuideId === g.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {g.component}
              </button>
            ))}
          </div>
        </div>

        {selectedGuide && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Guide Meta */}
            <div className="md:col-span-4 p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  PROCEDURE SUMMARY
                </span>
                <h4 className="text-base font-bold text-white mt-1">
                  {selectedGuide.component} Replacement
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Estimated Duration:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {selectedGuide.duration_minutes} mins
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Skill Level:</span>
                  <span className="font-bold text-emerald-400">{selectedGuide.difficulty}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Required Tools &amp; Materials
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedGuide.tools.map((tool: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      <span>{tool}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step-by-Step Sequence */}
            <div className="md:col-span-8 space-y-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Servicing Sequence
              </span>
              {selectedGuide.steps.map((step: string, sIdx: number) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5"
                >
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {sIdx + 1}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Routine Preventative Checklist & Service History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Preventative Checklist */}
        <div className="lg:col-span-5 p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            Routine Maintenance Checklist
          </h3>
          <div className="space-y-2.5">
            {checklist.map((c) => (
              <div
                key={c.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <h5 className="text-xs font-bold text-white">{c.task}</h5>
                    <span className="text-[10px] text-slate-400">Cadence: {c.frequency}</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 uppercase">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Service History Audit Table */}
        <div className="lg:col-span-7 p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Service Log Audit Trail
          </h3>

          <div className="space-y-3">
            {logs.map((log, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white">{log.component}</h4>
                  <span className="text-[11px] font-mono text-cyan-300">
                    {log.date.slice(0, 10)}
                  </span>
                </div>
                <p className="text-slate-300">{log.action}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>Technician: {log.technician}</span>
                  <span className="italic">{log.notes}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Maintenance Log Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel border border-cyan-500/40 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Log Maintenance Action</h3>
            <form onSubmit={handleCreateLog} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Component</label>
                <select
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="Sediment Filter (5 Micron)">Sediment Filter (5 Micron)</option>
                  <option value="Activated Carbon Block">Activated Carbon Block</option>
                  <option value="TFC Reverse Osmosis Membrane">TFC Reverse Osmosis Membrane</option>
                  <option value="Hollow-Fiber UF Filter">Hollow-Fiber UF Filter</option>
                  <option value="UV-C Disinfection Chamber">UV-C Disinfection Chamber</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Action Description</label>
                <input
                  type="text"
                  value={actionDesc}
                  onChange={(e) => setActionDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Technician / Servicer</label>
                <input
                  type="text"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Notes / Observations</label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                  rows={2}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
