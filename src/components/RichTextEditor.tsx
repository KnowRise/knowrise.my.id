'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { prepareAndUploadFile } from '../lib/uploadImage';
import { renderRichContent } from '../lib/content';
import Gallery, { type GalleryImage } from './extensions/Gallery';
import type { ContentFormat } from '../types';
import type { MediaFolder } from '../lib/storage';

interface RichTextEditorProps {
  value: string;
  format: ContentFormat;
  onChange: (html: string) => void;
  folder: MediaFolder;
  placeholder?: string;
  minHeight?: number;
}

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="p-2 rounded-md transition-colors disabled:opacity-40"
      style={{
        background: active ? 'var(--green-dim)' : 'transparent',
        color: active ? 'var(--green)' : 'var(--text-secondary)',
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  format,
  onChange,
  folder,
  placeholder = 'Tulis konten di sini...',
  minHeight = 220,
}: RichTextEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const lastValue = useRef(value);
  const uploadingRef = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Gallery,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
    ],
    content: renderRichContent(value, format),
    editorProps: {
      attributes: {
        class: 'rich-content focus:outline-none',
        style: `min-height:${minHeight}px`,
      },
      handleDrop: (_view, event) => {
        const files = Array.from(event.dataTransfer?.files || []).filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        void handleFiles(files);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files || []).filter((f) => f.type.startsWith('image/'));
        if (!files.length) return false;
        event.preventDefault();
        void handleFiles(files);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = current.getHTML();
      lastValue.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    const html = renderRichContent(value, format);
    lastValue.current = value;
    editor.commands.setContent(html, { emitUpdate: false });
  }, [editor, value, format]);

  async function handleFiles(files: File[]) {
    if (!files.length || !editor || uploadingRef.current) return;
    uploadingRef.current = true;
    setError('');
    setUploading(true);
    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const { url, error: uploadError } = await prepareAndUploadFile(folder, file);
            return { file, url, error: uploadError };
          } catch (e) {
            return {
              file,
              url: undefined,
              error: e instanceof Error ? e.message : 'Upload gambar gagal.',
            };
          }
        })
      );

      const uploaded: GalleryImage[] = [];
      const failed: string[] = [];
      for (const result of results) {
        if (result.url) {
          uploaded.push({ src: result.url, alt: result.file.name });
        } else {
          failed.push(`${result.file.name}: ${result.error || 'Upload gagal.'}`);
        }
      }

      if (failed.length) setError(failed.join(' • '));
      if (!uploaded.length) return;

      if (uploaded.length > 1) {
        editor.chain().focus().insertContent({ type: 'gallery', attrs: { images: uploaded } }).run();
      } else {
        editor.chain().focus().setImage({ src: uploaded[0].src, alt: uploaded[0].alt }).run();
      }
    } finally {
      uploadingRef.current = false;
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL tautan:', previous || 'https://');
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center border rounded-xl" style={{ minHeight, borderColor: 'var(--input-border)' }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--green)' }} />
      </div>
    );
  }

  const divider = <span className="w-px h-5 mx-1" style={{ background: 'var(--card-border)' }} />;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--input-border)', background: 'var(--input-bg)' }}>
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <ToolbarButton title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Heading" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></ToolbarButton>
        {divider}
        <ToolbarButton title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="w-4 h-4" /></ToolbarButton>
        {divider}
        <ToolbarButton title="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify className="w-4 h-4" /></ToolbarButton>
        {divider}
        <ToolbarButton title="Link" active={editor.isActive('link')} onClick={setLink}><LinkIcon className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Upload gambar (bisa banyak)" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
        </ToolbarButton>
        {divider}
        <ToolbarButton title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-4 h-4" /></ToolbarButton>
        <ToolbarButton title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-4 h-4" /></ToolbarButton>
        {uploading && <span className="text-[10px] ml-1" style={{ color: 'var(--text-muted)' }}>Mengunggah...</span>}
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith('image/'));
          if (files.length) void handleFiles(files);
          else if (fileRef.current) fileRef.current.value = '';
        }}
      />

      {error && <p className="px-3 py-2 text-xs text-red-500 border-t" style={{ borderColor: 'var(--card-border)' }}>{error}</p>}
    </div>
  );
}
