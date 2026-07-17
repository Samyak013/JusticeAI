export type AgentId = 'researcher' | 'explainer' | 'recommendation' | 'generator';

export interface AgentInfo {
  id: AgentId;
  name: string;
  role: string;
  description: string;
  avatar: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agentId?: AgentId;
  agentName?: string;
  sources?: Array<{ title: string; uri: string }>;
}

export interface LegalAnalysis {
  researcher: {
    findings: string;
    statutes: string[];
    sources: Array<{ title: string; uri: string }>;
  };
  explainer: {
    summary: string;
    keyRights: string[];
    actionSteps: string[];
  };
  recommendation: {
    authorityName: string;
    reasoning: string;
    contactDetails: string;
    procedure: string;
  };
  generator: {
    letterTitle: string;
    letterBody: string;
    instructions: string;
  };
}

export interface CaseSession {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  language: string;
  createdAt: string;
  analysis?: LegalAnalysis;
  chatHistory: Message[];
}
