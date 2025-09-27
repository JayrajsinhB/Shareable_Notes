export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isEncrypted: boolean;
  tags: string[];
  summary?: string;
  glossaryTerms?: GlossaryTerm[];
  grammarErrors?: GrammarError[];
}

export interface GlossaryTerm {
  text: string;
  definition: string;
  startIndex: number;
  endIndex: number;
}

export interface GrammarError {
  text: string;
  suggestion: string;
  startIndex: number;
  endIndex: number;
  type: 'grammar' | 'spelling';
}

export interface EditorFormat {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'left' | 'center' | 'right';
  fontSize: number;
}

export interface AIInsights {
  summary: string;
  suggestedTags: string[];
  keyTerms: GlossaryTerm[];
  grammarSuggestions: GrammarError[];
}