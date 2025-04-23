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
import { IconBold, IconItalic, IconArrowBack, IconList, IconListNumbers, IconListCheck, IconEyeMinus, IconPhoto } from '@tabler/icons-react';
import EmojiPicker from 'emoji-picker-react';
import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { convertTo12Hour, createPost } from '@/lib/api/user';
import PostBox from './PostBox';
import { useSession } from 'next-auth/react';
import PostModal from './PostModel';


export default function TextFormatterClient({ slot }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showListOptions, setShowListOptions] = useState(false);
  const [activeFormat, setActiveFormat] = useState(null);
  const { data: session } = useSession();
  const fileInputRef = useRef(null);


  const [time, setTime] = useState('');
  const [openModel, setOpenModel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null);
  const [image, setImage] = useState(null);


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
    console.log(image)
    const payload = {
      content: data,
      image: image ?? null
    };
    createPost('users/create-post', payload, session?.accessToken)
      .then((response) => {
        const newContent = '';
        editor.commands.setContent(newContent);
        setOpenModel(false);
        toast.success(response?.message);
      })
      .catch((err) => {
        toast.error('Failed to create post');
      });
  };

  const handlSlotPost = () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);
    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }
    const payload = {
      content: data,
      is_slot: slot[0]?.id,
      image: image ?? null
    };

    createPost('users/create-post', payload, session?.accessToken)
      .then((response) => {
        const newContent = '';
        editor.commands.setContent(newContent);
        setOpenModel(false);
        toast.success(response?.message);
      })
      .catch((err) => {
        console.log(err)
        toast.error('Failed to create post');
      });
  };

  const handlSchedulePost = () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);
    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }
    const payload = {
      content: data,
      time: time.split('T')[1],
      date: time.split('T')[0],
      is_schedule: true,
      image: image ?? null
    };

    createPost('users/create-post', payload, session?.accessToken)
      .then((response) => {
        const newContent = '';
        editor.commands.setContent(newContent);
        setOpenModel(false);
        toast.success(response?.message);
      })
      .catch((err) => {
        console.log(err)
        toast.error('Failed to create post');
      });
  };

  const runApiAndUpdateEditor = (type) => {
    const content = editor.getText();

    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }

    setLoading(true);
    setActiveAction(type)
    const payload = {
      inputText: content,
      type: type,
    };

    createPost('users/AI-assist-V1', payload, session?.accessToken)
      .then((response) => {
        const newContent = response?.data || '';
        editor.commands.setContent(newContent);
        setLoading(false);
        toast.success(response?.message);
      })
      .catch((err) => {
        console.log(err)
        toast.error('Failed to create post');
      });
  };

  const handlSchedulePostModel = () => {
    if (!editor.getText()) {
      toast.error('Post is empty!');
      return;
    }
    return setOpenModel(true);
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
    immediatelyRender: false,
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
      }

      setActiveFormat(null);
    }, 50);
  }, [editor, hasSelection]);


  const onEmojiClick = useCallback((emojiObject) => {
    editor?.chain().focus().insertContent(emojiObject.emoji).run();
    setShowEmojiPicker(false);
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setImage(data?.imageUrl)
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);
    }
  };
  

  return (
    <div className="rich-text-container flex justify-between px-4" style={{ position: 'relative' }}>

      <div className="w-[60%]">
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
            <div style={{ position: 'relative' }}>
              <input
                type="file"
                onChange={handleFileChange}
                ref={fileInputRef}
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

        <RichTextEditor editor={editor} >
          <RichTextEditor.Content />
        </RichTextEditor>



        <div className="py-6">
          <div className="flex flex-wrap gap-4 justify-start">
            {[
              { label: 'Continue writing', action: 'continue' },
              { label: 'Improve writing', action: 'improve' },
              { label: 'Fix grammar', action: 'grammar' },
              { label: 'Make shorter', action: 'shorter' },
              { label: 'Make longer', action: 'longer' },
              { label: 'Rewrite in a positive tone', action: 'positive' },
              { label: 'Simplify text', action: 'simplify' },
              { label: 'Add a hook', action: 'hook' },
              { label: 'Add a CTA', action: 'cta' },
              { label: 'Add an emoji', action: 'emoji' },
              { label: 'Add concrete examples', action: 'examples' },
            ].map(({ label, action }) => (
              <button
                key={action}
                className="relative z-0 rounded bg-black px-6 py-2 text-white text-sm font-medium transition-all duration-300 after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-0 after:rounded after:bg-pink-700 after:transition-all after:duration-300 hover:after:w-full"
                onClick={() => runApiAndUpdateEditor(action)}
              >
                {label} {activeAction == action && (
                  loading ? '⏳ Thinking...' : label
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="editor-footer flex mt-10">

          {slot[0]?.time && (
            <button onClick={handlSlotPost} className="relative block group mx-3">
              <span className="absolute inset-0 bg-green-500 rounded-lg transition-all duration-300 group-hover:bg-green-600"></span>
              <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="p-2">
                  <p className="text-sm font-outerSans font-medium text-white mb-1">Add to Que {slot[0]?.time && convertTo12Hour(slot[0]?.time)}</p>
                </div>
              </div>
            </button>
          )}

          <button onClick={handlSchedulePostModel} className="relative block group mx-3">
            <span className="absolute inset-0 bg-amber-400 rounded-lg transition-all duration-300 group-hover:bg-amber-500"></span>
            <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
              <div className="p-2">
                <p className="text-sm font-outerSans font-medium text-white mb-1">Schedule</p>
              </div>
            </div>
          </button>

          <button onClick={handlePostNow} className="relative block group mx-3">
            <span className="absolute inset-0 bg-indigo-500 rounded-lg transition-all duration-300 group-hover:bg-indigo-600"></span>
            <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
              <div className="p-2">
                <p className="text-sm font-outerSans font-medium text-white mb-1">Post now</p>
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="my-20">
        {editor && <PostBox content={editor.getText() ? editor.getHTML() : null} />}
      </div>
      {openModel && <PostModal slot={slot} setOpenModel={setOpenModel} setTime={setTime} time={time} handlePostNow={handlePostNow} handlSchedulePost={handlSchedulePost} handlSlotPost={handlSlotPost} />}
    </div>
  );
}