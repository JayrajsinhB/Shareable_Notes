import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Minus,
  Plus,
  Sparkles,
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorFormat } from '@/types/notes';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAIAnalysis?: () => void;
  isEncrypted?: boolean;
  onToggleEncryption?: () => void;
  className?: string;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  onAIAnalysis,
  isEncrypted = false,
  onToggleEncryption,
  className 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [format, setFormat] = useState<EditorFormat>({
    bold: false,
    italic: false,
    underline: false,
    alignment: 'left',
    fontSize: 16
  });

  // Update content when prop changes
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      onChange(newContent);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    
    // Update format state
    setTimeout(() => {
      setFormat(prev => ({
        ...prev,
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
      }));
    }, 10);
  }, []);

  const handleAlignment = useCallback((alignment: 'left' | 'center' | 'right') => {
    const alignCommands = {
      left: 'justifyLeft',
      center: 'justifyCenter', 
      right: 'justifyRight'
    };
    
    execCommand(alignCommands[alignment]);
    setFormat(prev => ({ ...prev, alignment }));
  }, [execCommand]);

  const handleFontSize = useCallback((change: number) => {
    const newSize = Math.max(12, Math.min(24, format.fontSize + change));
    setFormat(prev => ({ ...prev, fontSize: newSize }));
    
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (!range.collapsed) {
          const span = document.createElement('span');
          span.style.fontSize = `${newSize}px`;
          try {
            range.surroundContents(span);
          } catch {
            // Fallback for complex selections
            execCommand('fontSize', '3');
          }
        }
      }
    }
  }, [format.fontSize, execCommand]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          execCommand('underline');
          break;
      }
    }
  }, [execCommand]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b bg-card/50 rounded-t-lg">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <Button
            variant={format.bold ? "default" : "ghost"}
            size="sm"
            onClick={() => execCommand('bold')}
            className="h-8 w-8 p-0"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={format.italic ? "default" : "ghost"}
            size="sm"
            onClick={() => execCommand('italic')}
            className="h-8 w-8 p-0"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={format.underline ? "default" : "ghost"}
            size="sm"
            onClick={() => execCommand('underline')}
            className="h-8 w-8 p-0"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Button
            variant={format.alignment === 'left' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleAlignment('left')}
            className="h-8 w-8 p-0"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={format.alignment === 'center' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleAlignment('center')}
            className="h-8 w-8 p-0"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={format.alignment === 'right' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleAlignment('right')}
            className="h-8 w-8 p-0"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Font size */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFontSize(-2)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[2rem] text-center">
            {format.fontSize}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleFontSize(2)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* AI Analysis */}
        {onAIAnalysis && (
          <Button
            variant="premium"
            size="sm"
            onClick={onAIAnalysis}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Analysis
          </Button>
        )}

        {/* Encryption toggle */}
        {onToggleEncryption && (
          <Button
            variant={isEncrypted ? "default" : "ghost"}
            size="sm"
            onClick={onToggleEncryption}
            className="h-8 w-8 p-0"
          >
            {isEncrypted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        className="rich-editor flex-1 bg-editor-bg rounded-b-lg text-foreground"
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning
        data-placeholder="Start writing your note..."
        style={{
          fontSize: `${format.fontSize}px`,
          textAlign: format.alignment
        }}
      />
    </div>
  );
}