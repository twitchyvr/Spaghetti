/**
 * Al Dente Editor Component - The Pantry Component Library
 * Professional rich text editor for noodle content creation and editing
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Code,
  Quote,
  Undo,
  Redo,
  Save,
  Eye,
  Type,
  Palette,
  MoreHorizontal,
  FileText,
  Download,
  Upload,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { EditorToolbarAction } from './types';

interface AlDenteEditorProps {
  initialContent?: string;
  placeholder?: string;
  onChange?: (content: string) => void;
  onSave?: (content: string) => void;
  isReadOnly?: boolean;
  showToolbar?: boolean;
  showWordCount?: boolean;
  maxLength?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AlDenteEditor: React.FC<AlDenteEditorProps> = ({
  initialContent = '',
  placeholder = 'Start cooking your noodle...',
  onChange,
  onSave,
  isReadOnly = false,
  showToolbar = true,
  showWordCount = true,
  maxLength,
  autoSave = false,
  autoSaveInterval = 30000, // 30 seconds
  className = '',
  style
}) => {
  const [content, setContent] = useState(initialContent);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout>();

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty && onSave) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
      
      autoSaveTimer.current = setTimeout(() => {
        handleSave();
      }, autoSaveInterval);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content, isDirty, autoSave, autoSaveInterval, onSave]);

  // Update word and character counts
  useEffect(() => {
    const text = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    setWordCount(words);
    setCharacterCount(chars);
  }, [content]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
    onChange?.(newContent);
  }, [onChange]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(content);
      setLastSaved(new Date());
      setIsDirty(false);
    }
  }, [content, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 's':
          e.preventDefault();
          handleSave();
          break;
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
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  }, [handleSave]);

  const execCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      document.execCommand(command, false, value);
      const newContent = editorRef.current.innerHTML;
      handleContentChange(newContent);
    }
  }, [handleContentChange]);

  const insertLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  const toolbarActions: EditorToolbarAction[] = [
    {
      id: 'bold',
      label: 'Bold',
      icon: 'Bold',
      action: () => execCommand('bold'),
      isActive: document.queryCommandState?.('bold') || false
    },
    {
      id: 'italic', 
      label: 'Italic',
      icon: 'Italic',
      action: () => execCommand('italic'),
      isActive: document.queryCommandState?.('italic') || false
    },
    {
      id: 'underline',
      label: 'Underline', 
      icon: 'Underline',
      action: () => execCommand('underline'),
      isActive: document.queryCommandState?.('underline') || false
    },
    {
      id: 'separator1',
      label: '',
      icon: '',
      action: () => {}
    },
    {
      id: 'alignLeft',
      label: 'Align Left',
      icon: 'AlignLeft',
      action: () => execCommand('justifyLeft')
    },
    {
      id: 'alignCenter',
      label: 'Align Center',
      icon: 'AlignCenter', 
      action: () => execCommand('justifyCenter')
    },
    {
      id: 'alignRight',
      label: 'Align Right',
      icon: 'AlignRight',
      action: () => execCommand('justifyRight')
    },
    {
      id: 'separator2',
      label: '',
      icon: '',
      action: () => {}
    },
    {
      id: 'bulletList',
      label: 'Bullet List',
      icon: 'List',
      action: () => execCommand('insertUnorderedList')
    },
    {
      id: 'numberList',
      label: 'Numbered List',
      icon: 'ListOrdered',
      action: () => execCommand('insertOrderedList')
    },
    {
      id: 'separator3',
      label: '',
      icon: '',
      action: () => {}
    },
    {
      id: 'link',
      label: 'Insert Link',
      icon: 'Link',
      action: insertLink
    },
    {
      id: 'image',
      label: 'Insert Image',
      icon: 'Image',
      action: insertImage
    },
    {
      id: 'code',
      label: 'Code Block',
      icon: 'Code',
      action: () => execCommand('formatBlock', 'pre')
    },
    {
      id: 'quote',
      label: 'Quote',
      icon: 'Quote',
      action: () => execCommand('formatBlock', 'blockquote')
    }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
      List, ListOrdered, Link, Image, Code, Quote, Undo, Redo,
      Save, Eye, Type, Palette, MoreHorizontal, FileText,
      Download, Upload, Maximize2, Minimize2
    };
    return icons[iconName] || FileText;
  };

  const editorClasses = `
    prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none
    min-h-96 p-4 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    ${isReadOnly ? 'bg-gray-50' : 'bg-white'}
    ${isFullscreen ? 'fixed inset-4 z-50 min-h-screen' : ''}
    ${className}
  `;

  return (
    <div className={`al-dente-editor ${isFullscreen ? 'fixed inset-0 z-40 bg-white' : ''}`} style={style}>
      {/* Toolbar */}
      {showToolbar && !isReadOnly && (
        <div className="toolbar border border-gray-300 rounded-t-lg bg-gray-50 px-4 py-2 flex flex-wrap items-center gap-1">
          {toolbarActions.map((action) => {
            if (action.id.startsWith('separator')) {
              return <div key={action.id} className="w-px h-6 bg-gray-300 mx-1" />;
            }

            const IconComponent = getIconComponent(action.icon);
            
            return (
              <button
                key={action.id}
                onClick={action.action}
                disabled={action.isDisabled}
                className={`
                  p-2 rounded transition-colors duration-200
                  ${action.isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }
                  ${action.isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                title={action.label}
              >
                <IconComponent size={16} />
              </button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right side actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`p-2 rounded transition-colors ${
                showPreview ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              <Eye size={16} />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded text-gray-600 hover:bg-gray-100 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {onSave && (
              <button
                onClick={handleSave}
                disabled={!isDirty}
                className={`
                  p-2 rounded transition-colors
                  ${isDirty 
                    ? 'text-green-600 hover:bg-green-100' 
                    : 'text-gray-400 cursor-not-allowed'
                  }
                `}
                title="Save"
              >
                <Save size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className={`editor-container ${showPreview ? 'grid grid-cols-2 gap-4' : ''}`}>
        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable={!isReadOnly}
          suppressContentEditableWarning
          onInput={(e) => handleContentChange(e.currentTarget.innerHTML)}
          onKeyDown={handleKeyDown}
          className={editorClasses}
          dangerouslySetInnerHTML={{ __html: content }}
          data-placeholder={!content ? placeholder : undefined}
          style={{
            minHeight: isFullscreen ? 'calc(100vh - 200px)' : '384px'
          }}
        />

        {/* Preview */}
        {showPreview && (
          <div className="preview-pane">
            <div className="bg-gray-50 border-b px-4 py-2">
              <h3 className="text-sm font-medium text-gray-700">Preview</h3>
            </div>
            <div 
              className="prose prose-sm max-w-none p-4 bg-white border border-gray-300 rounded-b-lg"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                minHeight: isFullscreen ? 'calc(100vh - 200px)' : '384px'
              }}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="status-bar border border-t-0 border-gray-300 rounded-b-lg bg-gray-50 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          {showWordCount && (
            <>
              <span>{wordCount} words</span>
              <span>{characterCount} characters</span>
              {maxLength && (
                <span className={characterCount > maxLength ? 'text-red-600' : ''}>
                  {characterCount}/{maxLength}
                </span>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {isDirty && <span className="text-orange-600">Unsaved changes</span>}
          {lastSaved && (
            <span>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {autoSave && (
            <span className="text-green-600">Auto-save enabled</span>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30" />
      )}
    </div>
  );
};

/* 
 * CSS for Al Dente Editor styling (add to global styles):
 * 
 * .al-dente-editor [contenteditable]:empty::before {
 *   content: attr(data-placeholder);
 *   color: #9CA3AF;
 *   pointer-events: none;
 * }
 * 
 * .al-dente-editor .prose blockquote {
 *   border-left: 4px solid #3B82F6;
 *   padding-left: 1rem;
 *   font-style: italic;
 *   background-color: #F8FAFC;
 *   margin: 1rem 0;
 *   padding: 1rem;
 *   border-radius: 0.375rem;
 * }
 * 
 * .al-dente-editor .prose pre {
 *   background-color: #1F2937;
 *   color: #F9FAFB;
 *   padding: 1rem;
 *   border-radius: 0.375rem;
 *   overflow-x: auto;
 * }
 * 
 * .al-dente-editor .prose code {
 *   background-color: #F3F4F6;
 *   padding: 0.125rem 0.25rem;
 *   border-radius: 0.25rem;
 *   font-size: 0.875em;
 * }
 */

export default AlDenteEditor;