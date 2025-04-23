'use client';

import {
  RichTextEditor,
  Link,
} from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { IconBold, IconItalic, IconUnderline, IconStrikethrough, IconPhoto, IconArrowBack, IconList, IconListNumbers, IconListCheck, IconEyeMinus } from '@tabler/icons-react';
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';

import { createPost } from '@/lib/api/user';


export default function TextFormatterClient() {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);
  const fileInputRef = useRef(null);


  const convertHtmlToText = (html) => {
    const boldMap = { upper: 0x1D400, lower: 0x1D41A };
    const italicMap = { upper: 0x1D434, lower: 0x1D44E };

    const styleText = (text, style) =>
      text.split('').map(char => {
        const code = char.charCodeAt(0);
        if (style === 'bold') {
          if (code >= 65 && code <= 90) return String.fromCodePoint(boldMap.upper + (code - 65));
          if (code >= 97 && code <= 122) return String.fromCodePoint(boldMap.lower + (code - 97));
        }
        if (style === 'italic') {
          if (code >= 65 && code <= 90) return String.fromCodePoint(italicMap.upper + (code - 65));
          if (code >= 97 && code <= 122) return String.fromCodePoint(italicMap.lower + (code - 97));
        }
        return char;
      }).join('');

    const parse = (node) => {
      if (node.nodeType === 3) return node.textContent;
      const tag = node.nodeName.toLowerCase();
      const children = Array.from(node.childNodes).map(parse).join('');

      switch (tag) {
        case 'br': return '\n';
        case 'p':
        case 'div': return children + '\n';
        case 'strong':
        case 'b': return styleText(children, 'bold');
        case 'em':
        case 'i': return styleText(children, 'italic');
        case 'u': return `_${children}_`;
        case 's':
        case 'del': return `~${children}~`;
        case 'ul':
          return Array.from(node.children).map(li => {
            const text = parse(li).trim();
            return text ? `• ${text}` : '';
          }).filter(Boolean).join('\n');

        case 'ol':
          return Array.from(node.children).map((li, i) => {
            const text = parse(li).trim();
            return text ? `${i + 1}. ${text}` : '';
          }).filter(Boolean).join('\n');

        case 'li':
          return children.trim();
        default: return children;
      }
    };

    const container = document.createElement('div');
    container.innerHTML = html;
    return Array.from(container.childNodes).map(parse).join('').replace(/\n{3,}/g, '\n\n').trim();
  };




  const handlePostNow = () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);
    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }
    const payload = {
      author: 'SA44r1j6Mz',
      content: data,
    };

    createPost('users/create-post', payload)
      .then((response) => {
        toast.success('Post created successfully!');
      })
      .catch((err) => {
        console.log(err)
        toast.error('Failed to create post');
      });
  };


  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Write here...',
      }),
    ],
    content: '',
  });

  const hasSelection = useCallback(() => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);


  const applyFormat = useCallback((formatType, action) => {
    if (!editor) return;

    if (!hasSelection()) {
      toast.error('Please select some text to apply formatting.');
      return;
    }

    editor.chain().focus();
    action();

    setTimeout(() => {
      editor.commands.setTextSelection(editor.state.selection.to);
      editor.chain().focus();

      switch (formatType) {
        case 'bold':
          editor.commands.unsetBold();
          break;
        case 'italic':
          editor.commands.unsetItalic();
          break;
        case 'underline':
          editor.commands.unsetUnderline();
          break;
        case 'strike':
          editor.commands.unsetStrike();
          break;
      }

      setActiveFormat(null);
    }, 50);
  }, [editor, hasSelection]);


  const onEmojiClick = useCallback((emojiObject) => {
    editor?.chain().focus().insertContent(emojiObject.emoji).run();
    setShowEmojiPicker(false);
  }, [editor, hasSelection]);

  const handleFileUpload = useCallback((event) => {

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (file.type.startsWith('image/')) {
          editor?.chain().focus().setImage({ src: e.target.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  }, [editor, hasSelection]);

  const sortList = useCallback((order) => {
    if (!hasSelection()) {
      toast.error('Please select a list to sort!');
      return;
    }

    const content = editor?.getJSON();
    const lists = content?.content?.filter(node =>
      node.type === 'bulletList' || node.type === 'orderedList'
    );

    if (!lists || lists.length === 0) {
      toast.error('No list found in selection!');
      return;
    }

    lists?.forEach(list => {
      const items = list.content || [];
      if (items.length === 0) {
        toast.error('Selected list is empty!');
        return;
      }

      const sorted = [...items].sort((a, b) => {
        const textA = a.content?.[0]?.content?.[0]?.text || '';
        const textB = b.content?.[0]?.content?.[0]?.text || '';
        return order === 'asc' ?
          textA.length - textB.length :
          textB.length - textA.length;
      });

      const newList = {
        ...list,
        content: sorted
      };

      editor?.chain()
        .focus()
        .deleteNode(list.type)
        .insertContent(newList)
        .run();
    });

    setShowListOptions(false);
    setActiveFormat('list');
    toast.success(`List sorted ${order === 'asc' ? 'ascending' : 'descending'}`);
  }, [editor, hasSelection]);

  const CustomButton = useMemo(() => ({ icon: Icon, onClick, title, isActive }) => (
    <button
      className="mantine-UnstyledButton-root mantine-RichTextEditor-control"
      type="button"
      title={title}
      onClick={onClick}
      style={{
        padding: '8px',
        background: isActive ? '#e9ecef' : 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        borderRadius: '4px'
      }}
    >
      <Icon size={20} stroke={1.5} />
    </button>
  ), []);

  return (
    <div className="rich-text-container" style={{ position: 'relative' }}>
      <div className="editor-toolbar" style={{
        display: 'flex',
        gap: '8px',
        padding: '8px',
        background: '#f8f9fa',
        borderRadius: '4px',
        marginBottom: '8px',
        position: 'relative'
      }}>
        <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
          <CustomButton
            icon={IconBold}
            onClick={() => applyFormat('bold', () => editor?.chain().focus().toggleBold().run())}
            title="Bold"
            isActive={editor?.isActive('bold')}
          />
          <CustomButton
            icon={IconItalic}
            onClick={() => applyFormat('italic', () => editor?.chain().focus().toggleItalic().run())}
            title="Italic"
            isActive={editor?.isActive('italic')}
          />
          <CustomButton
            icon={IconUnderline}
            onClick={() => applyFormat('underline', () => editor?.chain().focus().toggleUnderline().run())}
            title="Underline"
            isActive={editor?.isActive('underline')}
          />
          <CustomButton
            icon={IconStrikethrough}
            onClick={() => applyFormat('strike', () => editor?.chain().focus().toggleStrike().run())}
            title="Strike through"
            isActive={editor?.isActive('strike')}
          />
        </div>

        <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
          <CustomButton
            icon={IconEyeMinus}
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
            }}
            title="Emoji"
            isActive={showEmojiPicker}
          />
          <div style={{ position: 'relative' }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              accept="image/*,.pdf"
            />
            <CustomButton
              icon={IconPhoto}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              title="Upload image/PDF"
            />
          </div>
        </div>

        <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
          <CustomButton
            icon={IconArrowBack}
            onClick={() => editor?.chain().focus().undo().run()}
            title="Undo"
          />
        </div>

        <div className="toolbar-group" style={{ display: 'flex', gap: '4px', position: 'relative' }}>
          <CustomButton
            icon={IconList}
            onClick={() => applyFormat('bulletList', () => editor?.chain().focus().toggleBulletList().run())}
            title="Bullet list"
            isActive={editor?.isActive('bulletList')}
          />
          <CustomButton
            icon={IconListNumbers}
            onClick={() => applyFormat('orderedList', () => editor?.chain().focus().toggleOrderedList().run())}
            title="Numbered list"
            isActive={editor?.isActive('orderedList')}
          />
          <CustomButton
            icon={IconListCheck}
            onClick={() => {
              if (!hasSelection()) {
                toast.error('Please select a list to format!');
                return;
              }
              setShowListOptions(!showListOptions);
            }}
            title="List options"
            isActive={showListOptions}
          />
          {showListOptions && (
            <div style={{
              position: 'absolute',
              zIndex: 1000,
              background: 'white',
              border: '1px solid #e9ecef',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              padding: '8px 0',
              minWidth: '240px',
              right: 0,
              top: '100%',
              marginTop: '4px'
            }}>
              <button
                onClick={() => sortList('asc')}
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: activeFormat === 'asc' ? '#f8f9fa' : 'none',
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <IconListNumbers size={16} />
                Ascending (Shortest to Longest)
              </button>
              <button
                onClick={() => sortList('desc')}
                style={{
                  display: 'flex',
                  width: '100%',
                  padding: '8px 16px',
                  border: 'none',
                  background: activeFormat === 'desc' ? '#f8f9fa' : 'none',
                  cursor: 'pointer',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}
              >
                <IconListNumbers size={16} />
                Descending (Longest to Shortest)
              </button>
            </div>
          )}
        </div>
      </div>

      {showEmojiPicker && (
        <div style={{
          position: 'absolute',
          zIndex: 1000,
          top: '100%',
          left: 0
        }}>
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
      )}

      <RichTextEditor editor={editor}>
        <RichTextEditor.Content />
      </RichTextEditor>

      <div className="editor-footer" style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px'
      }}>
        <button
          className="copy-text-btn"
          style={{
            padding: '8px 16px',
            background: '#f1f3f5',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'background 0.2s ease'
          }}
        >
          Copy text
        </button>
        <button
          className="schedule-btn"
          style={{
            padding: '8px 16px',
            background: '#ffd8cc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: '#ff4400',
            transition: 'all 0.2s ease'
          }}
        >
          Schedule
        </button>
        <button
          onClick={handlePostNow}
          className="post-now-btn"
          style={{
            padding: '8px 16px',
            background: '#74c0fc',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            color: 'white',
            transition: 'all 0.2s ease'
          }}
        >
          Post now
        </button>
      </div>
    </div>
  );
}