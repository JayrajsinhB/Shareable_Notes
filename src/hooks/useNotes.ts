import { useState, useEffect, useCallback } from 'react';
import { Note } from '@/types/notes';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'notes-app-data';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const notesWithDates = parsed.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        setNotes(notesWithDates);
        
        // Auto-select first note if available
        if (notesWithDates.length > 0) {
          setSelectedNoteId(notesWithDates[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes from storage",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
      toast({
        title: "Error",
        description: "Failed to save notes to storage",
        variant: "destructive"
      });
    }
  }, [notes, toast]);

  const createNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
      isEncrypted: false,
      tags: [],
    };

    setNotes(prev => [newNote, ...prev]);
    setSelectedNoteId(newNote.id);
    
    toast({
      title: "Note Created",
      description: "New note has been created successfully"
    });

    return newNote;
  }, [toast]);

  const updateNote = useCallback((noteId: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    ));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    
    // If deleted note was selected, select another note
    if (selectedNoteId === noteId) {
      const remainingNotes = notes.filter(note => note.id !== noteId);
      setSelectedNoteId(remainingNotes.length > 0 ? remainingNotes[0].id : null);
    }

    toast({
      title: "Note Deleted",
      description: "Note has been deleted successfully"
    });
  }, [notes, selectedNoteId, toast]);

  const togglePin = useCallback((noteId: string) => {
    setNotes(prev => {
      const updated = prev.map(note => 
        note.id === noteId 
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
          : note
      );
      
      // Sort notes with pinned ones first
      return updated.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      });
    });
  }, []);

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      // Pinned notes first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by update time
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const selectedNote = notes.find(note => note.id === selectedNoteId) || null;

  return {
    notes: filteredNotes,
    selectedNote,
    searchTerm,
    setSearchTerm,
    selectedNoteId,
    setSelectedNoteId,
    createNote,
    updateNote,
    deleteNote,
    togglePin
  };
}