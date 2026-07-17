import React from "react";
import { CaseSession } from "../types";
import * as Icons from "lucide-react";

interface HistorySidebarProps {
  sessions: CaseSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewSession,
}) => {
  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "housing":
        return <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">Housing</span>;
      case "labor":
        return <span className="bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">Labor</span>;
      case "consumer":
        return <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">Consumer</span>;
      case "civil":
        return <span className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">Civil Rights</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">General</span>;
    }
  };

  return (
    <div id="history-sidebar-container" className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Icons.FolderOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-400 text-[10px] tracking-widest uppercase font-display">Your Saved Cases</h3>
        </div>
        <button
          onClick={onNewSession}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
          title="Start New Consultation"
        >
          <Icons.Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px]">
        {sessions.length === 0 ? (
          <div className="py-8 text-center">
            <Icons.Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-xs font-medium">No saved files yet.</p>
            <p className="text-slate-400 text-[10px] leading-normal mt-1 px-4">Submit a case using the form to analyze statutes.</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                className={`group relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? "border-blue-500 bg-blue-50/25 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {getCategoryBadge(session.category)}
                    <span className="text-[9px] text-slate-400 font-medium">
                      {session.location.split(",")[0]}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-xs truncate leading-snug">
                    {session.title || "Untitled Legal Request"}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </p>
                </button>

                {/* Delete button hidden by default, visible on hover */}
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-600 transition-all flex-shrink-0"
                  title="Delete Session"
                >
                  <Icons.Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Sustainable Development Goals Note */}
      <div className="border-t border-slate-100 pt-4 mt-3 bg-indigo-50/20 rounded-xl p-3 border border-indigo-100/30">
        <div className="flex items-start gap-2">
          <Icons.Heart className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[10px] font-bold text-slate-800">UN SDG 16 Alignment</h5>
            <p className="text-[9px] text-slate-500 leading-relaxed mt-0.5">
              Promoting access to justice, transparent reporting mechanisms, and equal legal rights for all citizens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
