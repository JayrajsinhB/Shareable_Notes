import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Plus, 
  Pin, 
  Trash2, 
  MoreVertical,
  Lock,
  Calendar
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Note } from '@/types/notes';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface NoteSidebarProps {
  notes: Note[];
  selectedNoteId: string | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (noteId: string) => void;
  onTogglePin: (noteId: string) => void;
}

export function NoteSidebar({
  notes,
  selectedNoteId,
  searchTerm,
  onSearchChange,
  onNoteSelect,
  onCreateNote,
  onDeleteNote,
  onTogglePin
}: NoteSidebarProps) {
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const getPreviewText = (content: string) => {
    // Strip HTML tags and get first 100 characters
    const text = content.replace(/<[^>]*>/g, '').trim();
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  };

  return (
    <div className="w-80 bg-sidebar-bg border-r border-border flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            Smart Notes
          </h1>
          <Button
            onClick={onCreateNote}
            size="sm"
            variant="premium"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <div className="mb-2">No notes yet</div>
            <Button
              onClick={onCreateNote}
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
            >
              Create your first note
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "note-item p-3 rounded-lg cursor-pointer border border-transparent",
                  selectedNoteId === note.id && "bg-primary/5 border-primary/20",
                  "hover:bg-note-item-hover"
                )}
                onClick={() => onNoteSelect(note.id)}
                onMouseEnter={() => setHoveredNoteId(note.id)}
                onMouseLeave={() => setHoveredNoteId(null)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-2 mb-1">
                      {note.isPinned && (
                        <Pin className="h-3 w-3 text-primary fill-current" />
                      )}
                      {note.isEncrypted && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                      <h3 className="font-medium text-sm truncate flex-1">
                        {note.title || 'Untitled Note'}
                      </h3>
                    </div>
                    
                    {note.content && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {getPreviewText(note.content)}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(note.updatedAt, { addSuffix: true })}
                      </span>
                    </div>

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs py-0 px-1.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {(hoveredNoteId === note.id || selectedNoteId === note.id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(note.id);
                          }}
                        >
                          <Pin className="h-4 w-4 mr-2" />
                          {note.isPinned ? 'Unpin' : 'Pin'} Note
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Note
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          {notes.filter(n => n.isPinned).length > 0 && (
            <>
              {' • '}
              {notes.filter(n => n.isPinned).length} pinned
            </>
          )}
        </div>
      </div>
    </div>
  );
}