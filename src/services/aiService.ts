import { AIInsights, GlossaryTerm, GrammarError } from '@/types/notes';

// Mock AI service - In production, replace with actual AI API calls
export class AIService {
  private static instance: AIService;
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeContent(content: string): Promise<AIInsights> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const plainText = this.stripHtml(content);
    
    return {
      summary: this.generateSummary(plainText),
      suggestedTags: this.generateTags(plainText),
      keyTerms: this.findGlossaryTerms(plainText),
      grammarSuggestions: this.findGrammarErrors(plainText)
    };
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private generateSummary(text: string): string {
    if (!text || text.length < 50) {
      return "Note is too short to summarize effectively.";
    }
    
    // Simple extractive summarization
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length === 0) return "Unable to generate summary.";
    
    // Return first sentence or two as summary
    const summary = sentences.slice(0, 2).join('. ').trim();
    return summary.length > 150 ? summary.substring(0, 147) + '...' : summary + '.';
  }

  private generateTags(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const wordCount = new Map<string, number>();
    
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Get most frequent words as tags
    const sortedWords = Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => entry[0]);
    
    // Add some context-based tags
    const contextTags: string[] = [];
    if (text.includes('meeting') || text.includes('call')) contextTags.push('meeting');
    if (text.includes('project') || text.includes('task')) contextTags.push('project');
    if (text.includes('idea') || text.includes('brainstorm')) contextTags.push('ideas');
    if (text.includes('todo') || text.includes('task')) contextTags.push('tasks');
    if (text.includes('research') || text.includes('study')) contextTags.push('research');
    
    const allTags = [...new Set([...contextTags, ...sortedWords])];
    return allTags.slice(0, 5);
  }

  private findGlossaryTerms(text: string): GlossaryTerm[] {
    const terms = [
      { term: 'AI', definition: 'Artificial Intelligence - computer systems able to perform tasks that typically require human intelligence' },
      { term: 'API', definition: 'Application Programming Interface - a set of protocols and tools for building software applications' },
      { term: 'ML', definition: 'Machine Learning - a type of artificial intelligence that enables computers to learn without being explicitly programmed' },
      { term: 'SaaS', definition: 'Software as a Service - a software distribution model in which applications are hosted by a vendor and made available to customers over a network' },
      { term: 'MVP', definition: 'Minimum Viable Product - a product with just enough features to attract early-adopter customers and validate a product idea' },
      { term: 'UX', definition: 'User Experience - the overall experience of a person using a product, especially in terms of how easy or pleasing it is to use' },
      { term: 'UI', definition: 'User Interface - the space where interactions between humans and machines occur' },
      { term: 'CRM', definition: 'Customer Relationship Management - a technology for managing all your company\'s relationships and interactions with customers' }
    ];

    const glossaryTerms: GlossaryTerm[] = [];
    
    terms.forEach(({ term, definition }) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        glossaryTerms.push({
          text: match[0],
          definition,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    });
    
    return glossaryTerms;
  }

  private findGrammarErrors(text: string): GrammarError[] {
    const errors: GrammarError[] = [];
    
    // Simple grammar checks
    const commonErrors = [
      { pattern: /\bits\s+([a-z]+ing|[a-z]+ed)\b/gi, suggestion: "it's" },
      { pattern: /\byour\s+(going|coming|leaving)\b/gi, suggestion: "you're" },
      { pattern: /\bthere\s+(house|car|dog|cat)\b/gi, suggestion: "their" },
      { pattern: /\beffect\s+(on|upon)\b/gi, suggestion: "affect" },
      { pattern: /\bthen\s+(I|we|they|he|she)\s+(was|were)\b/gi, suggestion: "than" }
    ];

    commonErrors.forEach(({ pattern, suggestion }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        errors.push({
          text: match[0],
          suggestion: `Consider using "${suggestion}" instead`,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          type: 'grammar'
        });
      }
    });

    // Simple spelling checks (common typos)
    const spellingErrors = [
      { wrong: 'recieve', correct: 'receive' },
      { wrong: 'seperate', correct: 'separate' },
      { wrong: 'definately', correct: 'definitely' },
      { wrong: 'occured', correct: 'occurred' },
      { wrong: 'begining', correct: 'beginning' }
    ];

    spellingErrors.forEach(({ wrong, correct }) => {
      const regex = new RegExp(`\\b${wrong}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        errors.push({
          text: match[0],
          suggestion: `Did you mean "${correct}"?`,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          type: 'spelling'
        });
      }
    });

    return errors.slice(0, 10); // Limit to 10 suggestions
  }

  async translateText(text: string, targetLanguage: string): Promise<string> {
    // Mock translation - in production, use Google Translate or similar API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const translations: { [key: string]: { [key: string]: string } } = {
      es: {
        'Hello': 'Hola',
        'world': 'mundo',
        'note': 'nota',
        'text': 'texto'
      },
      fr: {
        'Hello': 'Bonjour',
        'world': 'monde',
        'note': 'note',
        'text': 'texte'
      },
      de: {
        'Hello': 'Hallo',
        'world': 'Welt',
        'note': 'Notiz',
        'text': 'Text'
      }
    };

    // Simple word replacement for demo
    let translated = text;
    const languageMap = translations[targetLanguage];
    
    if (languageMap) {
      Object.entries(languageMap).forEach(([english, foreign]) => {
        const regex = new RegExp(`\\b${english}\\b`, 'gi');
        translated = translated.replace(regex, foreign);
      });
    }
    
    return translated || `[Translated to ${targetLanguage}] ${text}`;
  }
}

export const aiService = AIService.getInstance();