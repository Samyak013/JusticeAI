import React from "react";
import { AgentInfo } from "../types";
import * as Icons from "lucide-react";

interface AgentCardProps {
  agent: AgentInfo;
  isActive: boolean;
  status: "idle" | "running" | "completed" | "error";
  onClick?: () => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isActive,
  status,
  onClick,
}) => {
  // Map icons dynamically
  const renderIcon = () => {
    switch (agent.id) {
      case "researcher":
        return <Icons.Search className="w-5 h-5 text-amber-600" />;
      case "explainer":
        return <Icons.FileText className="w-5 h-5 text-teal-600" />;
      case "recommendation":
        return <Icons.Landmark className="w-5 h-5 text-indigo-600" />;
      case "generator":
        return <Icons.PenTool className="w-5 h-5 text-rose-600" />;
      default:
        return <Icons.Scale className="w-5 h-5 text-slate-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Analyzing...
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Icons.Check className="w-3 h-3" /> Ready
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <Icons.AlertTriangle className="w-3 h-3" /> Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            Idle
          </span>
        );
    }
  };

  return (
    <button
      id={`agent-card-${agent.id}`}
      onClick={onClick}
      className={`text-left w-full p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
        isActive
          ? "border-blue-500 bg-blue-50/25 shadow-xs ring-2 ring-blue-500/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{agent.avatar}</span>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5 font-display">
              {agent.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">{agent.role}</p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>
      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
        {agent.description}
      </p>
      
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-md ${agent.bgColor} border ${agent.borderColor}`}>
            {renderIcon()}
          </div>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Specialist
          </span>
        </div>
        <span className="text-xs text-blue-600 font-bold hover:translate-x-0.5 transition-transform">
          Consult &rarr;
        </span>
      </div>
    </button>
  );
};
