import React, { useState, useCallback, useEffect } from 'react';
import { NoteSidebar } from '@/components/NoteSidebar';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNotes } from '@/hooks/useNotes';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';
import { encryptionService } from '@/utils/encryption';
import { 
  Sparkles, 
  Tag, 
  Lock, 
  Unlock, 
  Languages,
  Loader2,
  FileText,
  Brain,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Index = () => {
  const {
    notes,
    selectedNote,
    searchTerm,
    setSearchTerm,
    selectedNoteId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    togglePin
  } = useNotes();

  const { toast } = useToast();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingEncryption, setPendingEncryption] = useState<'encrypt' | 'decrypt' | null>(null);
  const [showTranslateDialog, setShowTranslateDialog] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [decryptedContent, setDecryptedContent] = useState<string>('');

  // Handle title changes
  const handleTitleChange = useCallback((title: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { title });
    }
  }, [selectedNote, updateNote]);

  // Handle content changes  
  const handleContentChange = useCallback((content: string) => {
    if (selectedNote) {
      updateNote(selectedNote.id, { content });
      if (selectedNote.isEncrypted) {
        setDecryptedContent(content);
      }
    }
  }, [selectedNote, updateNote]);

  // Handle AI Analysis
  const handleAIAnalysis = useCallback(async () => {
    if (!selectedNote || isAnalyzing) return;
    
    const contentToAnalyze = selectedNote.isEncrypted ? decryptedContent : selectedNote.content;
    if (!contentToAnalyze?.trim()) {
      toast({
        title: "Nothing to analyze",
        description: "Please add some content to your note first.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const insights = await aiService.analyzeContent(contentToAnalyze);
      
      updateNote(selectedNote.id, {
        summary: insights.summary,
        tags: [...new Set([...selectedNote.tags, ...insights.suggestedTags])].slice(0, 8),
        glossaryTerms: insights.keyTerms,
        grammarErrors: insights.grammarSuggestions
      });

      toast({
        title: "AI Analysis Complete",
        description: `Generated summary and found ${insights.keyTerms.length} key terms.`
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not analyze note content. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedNote, decryptedContent, isAnalyzing, updateNote, toast]);

  // Handle encryption/decryption
  const handleEncryptionToggle = useCallback(() => {
    if (!selectedNote) return;
    
    if (selectedNote.isEncrypted) {
      setPendingEncryption('decrypt');
    } else {
      setPendingEncryption('encrypt');
    }
    setShowPasswordDialog(true);
  }, [selectedNote]);

  const processEncryption = useCallback(async () => {
    if (!selectedNote || !password || !pendingEncryption) return;

    try {
      if (pendingEncryption === 'encrypt') {
        const encrypted = await encryptionService.encrypt(selectedNote.content, password);
        updateNote(selectedNote.id, {
          content: encrypted,
          isEncrypted: true
        });
        setDecryptedContent(selectedNote.content);
        
        toast({
          title: "Note Encrypted",
          description: "Your note has been secured with a password."
        });
      } else {
        const decrypted = await encryptionService.decrypt(selectedNote.content, password);
        updateNote(selectedNote.id, {
          content: decrypted,
          isEncrypted: false
        });
        setDecryptedContent('');
        
        toast({
          title: "Note Decrypted",
          description: "Your note is now accessible without a password."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Encryption operation failed",
        variant: "destructive"
      });
    } finally {
      setPassword('');
      setPendingEncryption(null);
      setShowPasswordDialog(false);
    }
  }, [selectedNote, password, pendingEncryption, updateNote, toast]);

  // Handle translation
  const handleTranslate = useCallback(async () => {
    if (!selectedNote) return;
    
    const contentToTranslate = selectedNote.isEncrypted ? decryptedContent : selectedNote.content;
    if (!contentToTranslate?.trim()) {
      toast({
        title: "Nothing to translate",
        description: "Please add some content to your note first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const translated = await aiService.translateText(contentToTranslate, targetLanguage);
      
      if (selectedNote.isEncrypted) {
        setDecryptedContent(translated);
      } else {
        updateNote(selectedNote.id, { content: translated });
      }
      
      toast({
        title: "Translation Complete",
        description: `Note translated to ${targetLanguage.toUpperCase()}`
      });
    } catch (error) {
      toast({
        title: "Translation Failed",
        description: "Could not translate note. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowTranslateDialog(false);
    }
  }, [selectedNote, decryptedContent, targetLanguage, updateNote, toast]);

  // Load decrypted content when encrypted note is selected
  useEffect(() => {
    if (selectedNote?.isEncrypted && !decryptedContent) {
      const promptDecrypt = async () => {
        setPendingEncryption('decrypt');
        setShowPasswordDialog(true);
      };
      promptDecrypt();
    }
  }, [selectedNote?.id, selectedNote?.isEncrypted, decryptedContent]);

  const displayContent = selectedNote?.isEncrypted ? decryptedContent : (selectedNote?.content || '');

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <NoteSidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNoteSelect={setSelectedNoteId}
        onCreateNote={createNote}
        onDeleteNote={deleteNote}
        onTogglePin={togglePin}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-card/30">
              <div className="flex items-center gap-4 mb-4">
                <Input
                  value={selectedNote.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                  placeholder="Untitled Note"
                />
                {selectedNote.isEncrypted && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </Badge>
                )}
              </div>

              {/* AI Insights */}
              {selectedNote.summary && (
                <div className="mb-4 p-3 bg-gradient-subtle rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">AI Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedNote.summary}</p>
                </div>
              )}

              {/* Tags */}
              {selectedNote.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedNote.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing || !displayContent.trim()}
                  size="sm"
                  variant="premium"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
                </Button>

                <Button
                  onClick={() => setShowTranslateDialog(true)}
                  disabled={!displayContent.trim()}
                  variant="outline"
                  size="sm"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Translate
                </Button>

                <Button
                  onClick={handleEncryptionToggle}
                  variant="outline"
                  size="sm"
                >
                  {selectedNote.isEncrypted ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Unlock className="h-4 w-4 mr-2" />
                  )}
                  {selectedNote.isEncrypted ? 'Decrypt' : 'Encrypt'}
                </Button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 p-6">
              {selectedNote.isEncrypted && !decryptedContent ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>This note is encrypted. Enter your password to view it.</p>
                  </div>
                </div>
              ) : (
                <RichTextEditor
                  content={displayContent}
                  onChange={handleContentChange}
                  onAIAnalysis={handleAIAnalysis}
                  isEncrypted={selectedNote.isEncrypted}
                  onToggleEncryption={handleEncryptionToggle}
                  className="h-full"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
              <h2 className="text-2xl font-bold mb-4">Welcome to Smart Notes</h2>
              <p className="text-muted-foreground mb-6">
                Create your first note to get started with AI-powered note-taking
              </p>
              <Button onClick={createNote} variant="premium">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingEncryption === 'encrypt' ? 'Encrypt Note' : 'Decrypt Note'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {pendingEncryption === 'encrypt' 
                ? 'Enter a password to encrypt this note:'
                : 'Enter the password to decrypt this note:'
              }
            </p>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              onKeyDown={(e) => e.key === 'Enter' && processEncryption()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={processEncryption}
                disabled={!password}
                variant="premium"
              >
                {pendingEncryption === 'encrypt' ? 'Encrypt' : 'Decrypt'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Translation Dialog */}
      <Dialog open={showTranslateDialog} onOpenChange={setShowTranslateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Translate Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select the target language for translation:
            </p>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
                <SelectItem value="it">Italian</SelectItem>
                <SelectItem value="pt">Portuguese</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTranslateDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleTranslate}
                variant="premium"
              >
                Translate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
