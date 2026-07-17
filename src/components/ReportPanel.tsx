import React, { useState, useEffect } from "react";
import { LegalAnalysis, CaseSession, AgentId } from "../types";
import * as Icons from "lucide-react";
import { AgentChat } from "./AgentChat";

interface ReportPanelProps {
  analysis: LegalAnalysis;
  onTtsRequest: (text: string) => Promise<string>;
  session: CaseSession;
  activeAgentId: AgentId;
  setActiveAgentId: (id: AgentId) => void;
  onSendMessage: (text: string, agentId: AgentId) => Promise<void>;
  loading: boolean;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({ 
  analysis, 
  onTtsRequest,
  session,
  activeAgentId,
  setActiveAgentId,
  onSendMessage,
  loading
}) => {
  const [activeTab, setActiveTab] = useState<"research" | "rights" | "authority" | "letter" | "chat">("rights");
  const [copied, setCopied] = useState<boolean>(false);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  
  // Custom Demand Letter Placeholder Fields
  const [yourName, setYourName] = useState("Jane Doe");
  const [recipientName, setRecipientName] = useState("Property Manager / Landlord");
  const [disputedAmount, setDisputedAmount] = useState("$1,500.00");
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString());
  const [customLetterBody, setCustomLetterBody] = useState("");

  // Speech status
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speechLoading, setSpeechLoading] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Initialize the customized letter body when analysis loads
  useEffect(() => {
    if (analysis?.generator?.letterBody) {
      setCustomLetterBody(analysis.generator.letterBody);
      
      // Attempt to guess context to set intelligent defaults
      const text = analysis.generator.letterBody + " " + (analysis.recommendation?.authorityName || "");
      const isIndia = text.toLowerCase().includes("india") || text.toLowerCase().includes("maharashtra") || text.toLowerCase().includes("pune") || text.toLowerCase().includes("mumbai") || text.toLowerCase().includes("bengaluru") || text.toLowerCase().includes("rera");
      const isUK = text.toLowerCase().includes("uk") || text.toLowerCase().includes("london") || text.toLowerCase().includes("pound") || text.toLowerCase().includes("£");
      
      if (isIndia) {
        setYourName("Rahul Sharma");
        setRecipientName("D.Y. Patil Builders / Store Manager");
        setDisputedAmount("₹45,000.00");
      } else if (isUK) {
        setYourName("Alex Mercer");
        setRecipientName("Retail Store Manager");
        setDisputedAmount("£1,200.00");
      } else {
        setYourName("Jane Doe");
        setRecipientName("Property Manager / Landlord");
        setDisputedAmount("$1,500.00");
      }
    }
  }, [analysis]);

  // Handle dynamic template replacements
  const getCustomizedLetter = () => {
    let text = customLetterBody || analysis.generator.letterBody;
    
    // Replace standard bracket templates dynamically if present (both English and Indian languages equivalent)
    text = text.replace(/\[Your Name\]|\[आपका नाम\]|\[तुमचे नाव\]/gi, yourName);
    text = text.replace(/\[Recipient Name\]|\[Landlord Name\]|\[Employer Name\]|\[प्राप्तकर्ता का नाम\]|\[प्राप्तकर्त्याचे नाव\]|\[बिल्डरचे नाव\]|\[बिल्डर का नाम\]/gi, recipientName);
    text = text.replace(/\[Amount\]|\[Amounts\]|\[Disputed Amount\]|\[राशि\]|\[रक्कम\]/gi, disputedAmount);
    text = text.replace(/\[Date\]|\[Current Date\]|\[दिनांक\]|\[तारीख\]/gi, currentDate);
    
    return text;
  };

  const handleCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTtsPlayback = async (textToSpeak: string) => {
    if (isPlaying) {
      if (audioElement) {
        audioElement.pause();
        setIsPlaying(false);
      }
      return;
    }

    setSpeechLoading(true);
    try {
      // Stripping brackets or markdown markers for clean speech
      const cleanText = textToSpeak
        .replace(/[*#`_\-\[\]]/g, "")
        .substring(0, 400); // safety cap for speed

      const base64Audio = await onTtsRequest(cleanText);
      const audioUrl = `data:audio/mp3;base64,${base64Audio}`;
      const audio = new Audio(audioUrl);
      
      setAudioElement(audio);
      audio.play();
      setIsPlaying(true);
      
      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (err) {
      console.warn("Gemini TTS failed, falling back to browser SpeechSynthesis:", err);
      // Fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak.substring(0, 300));
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    } finally {
      setSpeechLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [audioElement]);

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div id="report-panel-container" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
      {/* Top bar with Tabs */}
      <div className="bg-slate-50 border-b border-slate-100 px-4 pt-3 flex flex-wrap gap-1 justify-between items-center">
        <div className="flex gap-1 overflow-x-auto pb-1 max-w-full">
          <button
            id="tab-rights"
            onClick={() => { setActiveTab("rights"); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === "rights"
                ? "bg-white border-t-2 border-blue-600 text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icons.Sparkles className="w-4 h-4 text-blue-600" />
            Rights Explanation
          </button>
          
          <button
            id="tab-research"
            onClick={() => { setActiveTab("research"); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === "research"
                ? "bg-white border-t-2 border-blue-600 text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icons.Search className="w-4 h-4 text-amber-600" />
            Legal Research Brief
          </button>

          <button
            id="tab-authority"
            onClick={() => { setActiveTab("authority"); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === "authority"
                ? "bg-white border-t-2 border-blue-600 text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icons.Building className="w-4 h-4 text-indigo-600" />
            Filing Venue
          </button>

          <button
            id="tab-letter"
            onClick={() => { setActiveTab("letter"); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === "letter"
                ? "bg-white border-t-2 border-blue-600 text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icons.PenSquare className="w-4 h-4 text-rose-600" />
            Demand Letter Draft
          </button>

          <button
            id="tab-chat"
            onClick={() => { setActiveTab("chat"); setIsPlaying(false); }}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-t-lg transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-white border-t-2 border-blue-600 text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Icons.MessageSquare className="w-4 h-4 text-emerald-600" />
            Specialist Chat
          </button>
        </div>

        {/* Global Panel Actions (Audio Narration) */}
        <div className="pb-2 flex items-center gap-2">
          <button
            id="btn-read-aloud"
            disabled={speechLoading}
            onClick={() => {
              const speakText =
                activeTab === "rights"
                  ? `${analysis.explainer.summary}. Your key rights are: ${analysis.explainer.keyRights.join(". ")}`
                  : activeTab === "research"
                  ? analysis.researcher.findings
                  : activeTab === "authority"
                  ? `${analysis.recommendation.authorityName}. ${analysis.recommendation.reasoning}`
                  : activeTab === "chat"
                  ? (session.chatHistory.filter(m => m.role === "assistant").slice(-1)[0]?.content || "Specialist chat is ready. You can ask follow-up questions to any of our legal board specialists here.")
                  : getCustomizedLetter();
              handleTtsPlayback(speakText);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all ${
              isPlaying
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {speechLoading ? (
              <Icons.Loader className="w-3.5 h-3.5 animate-spin" />
            ) : isPlaying ? (
              <Icons.Square className="w-3.5 h-3.5 fill-rose-600 stroke-none" />
            ) : (
              <Icons.Volume2 className="w-3.5 h-3.5" />
            )}
            {speechLoading ? "Synthesizing Voice..." : isPlaying ? "Stop Narration" : "Read Aloud"}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* TAB 1: RIGHTS EXPLANATION */}
        {activeTab === "rights" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50/35 rounded-xl p-4 border border-blue-100/60 flex gap-3.5">
              <span className="text-2xl mt-1">💡</span>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-widest font-display">Empathetic Legal Standing</h4>
                <p className="text-slate-600 text-xs leading-relaxed mt-1.5">{analysis.explainer.summary}</p>
              </div>
            </div>

            {/* Key Rights */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">Your Specific Legal Rights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.explainer.keyRights.map((right, idx) => (
                  <div key={idx} className="bg-slate-50/50 border border-slate-150 rounded-lg p-3 flex gap-2.5 items-start">
                    <Icons.ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-slate-700 leading-relaxed">{right}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Checklist */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-display">Your Next Steps Checklist</h4>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-100/50 font-display">Empowerment Guide</span>
              </div>
              <div className="space-y-2">
                {analysis.explainer.actionSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className="w-full text-left bg-white hover:bg-slate-50 border border-slate-200 rounded-lg p-3 flex gap-3 items-center transition-all cursor-pointer"
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      checkedSteps[idx] 
                        ? "bg-blue-600 border-blue-600 text-white" 
                        : "border-slate-300 text-transparent"
                    }`}>
                      <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className={`text-xs font-medium leading-relaxed transition-all ${
                      checkedSteps[idx] ? "text-slate-400 line-through" : "text-slate-700"
                    }`}>{step}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RESEARCH findings */}
        {activeTab === "research" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Statutes tags */}
            <div className="flex flex-wrap gap-2">
              {analysis.researcher.statutes.map((stat, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold px-2.5 py-1 rounded-md">
                  <Icons.Scale className="w-3 h-3 text-amber-600" />
                  {stat}
                </span>
              ))}
            </div>

            {/* Main legal brief text */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 relative">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 font-display">Legal Brief Findings</h4>
              <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {analysis.researcher.findings}
              </p>
              <button
                onClick={() => handleCopy(analysis.researcher.findings)}
                className="absolute top-4 right-4 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all shadow-xs cursor-pointer"
                title="Copy Brief"
              >
                {copied ? <Icons.Check className="w-4 h-4 text-green-600" /> : <Icons.Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Grounded Sources */}
            {analysis.researcher.sources.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">
                  Verified Legal Citations & Web Grounding (SDG 16 Transparency)
                </h4>
                <div className="space-y-2">
                  {analysis.researcher.sources.map((src, idx) => (
                    <a
                      key={idx}
                      href={src.uri}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/20 transition-all text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icons.Globe className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-700 max-w-[280px] sm:max-w-md truncate">{src.title}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600 font-bold font-display">
                        <span>Source Link</span>
                        <Icons.ExternalLink className="w-3.5 h-3.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: FILING AUTHORITY */}
        {activeTab === "authority" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50/30 border border-blue-100/60 rounded-xl p-5 flex gap-4 items-start">
              <span className="text-3xl">🏛️</span>
              <div>
                <h3 className="font-bold text-slate-950 text-sm font-display tracking-tight">{analysis.recommendation.authorityName}</h3>
                <p className="text-slate-600 text-xs leading-relaxed mt-1.5">
                  {analysis.recommendation.reasoning}
                </p>
              </div>
            </div>

            {/* Filing Procedures */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">Filing Procedures & Deadlines</h4>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-5">
                <p className="text-slate-700 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                  {analysis.recommendation.procedure}
                </p>
              </div>
            </div>

            {/* Contact details */}
            <div>
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 font-display">Authority Contact Avenues</h4>
              <div className="bg-white border border-slate-200 rounded-xl p-4 flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Icons.PhoneCall className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-700 text-xs font-medium">{analysis.recommendation.contactDetails}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Please check their website for official operating hours and filing fees.</p>
                </div>
                <button
                  onClick={() => handleCopy(analysis.recommendation.contactDetails)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Icons.Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEMAND LETTER */}
        {activeTab === "letter" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Interactive customize inputs */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5 font-display">
                <Icons.Sliders className="w-3.5 h-3.5 text-blue-600" />
                Dynamic Template Customizer
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-display">Your Name</label>
                  <input
                    type="text"
                    value={yourName}
                    onChange={(e) => setYourName(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-display">Opposing Party Name</label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-display">Claim/Deposit Amount</label>
                  <input
                    type="text"
                    value={disputedAmount}
                    onChange={(e) => setDisputedAmount(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase font-display">Date Of Delivery</label>
                  <input
                    type="text"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Letter Preview and Editor */}
            <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col relative">
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-display">{analysis.generator.letterTitle}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCopy(getCustomizedLetter())}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Copy Customized Letter"
                  >
                    {copied ? <Icons.Check className="w-4 h-4 text-green-600" /> : <Icons.Copy className="w-4 h-4" />}
                    <span>{copied ? "Copied" : "Copy Letter"}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(`${analysis.generator.letterTitle.toLowerCase().replace(/\s+/g, "_")}.txt`, getCustomizedLetter())}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Download Text File"
                  >
                    <Icons.Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 font-mono text-[11px] text-slate-800 bg-amber-50/5 leading-relaxed whitespace-pre-wrap min-h-[300px] border-b border-slate-100">
                {getCustomizedLetter()}
              </div>
            </div>

            {/* Transmit Instructions */}
            <div className="bg-blue-50/25 rounded-xl p-4 border border-blue-100/50 flex gap-3">
              <Icons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-800 text-xs font-display uppercase tracking-wider">How to Deliver this Document:</h5>
                <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                  {analysis.generator.instructions}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="animate-fadeIn h-full">
            <AgentChat
              session={session}
              activeAgentId={activeAgentId}
              setActiveAgentId={setActiveAgentId}
              onSendMessage={onSendMessage}
              loading={loading}
              borderless={true}
            />
          </div>
        )}

      </div>
    </div>
  );
};
