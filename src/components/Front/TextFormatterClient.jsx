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

import { convertTo12Hour, createPost, formatDate } from '@/lib/api/user';
import PostBox from './PostBox';
import { useSession } from 'next-auth/react';
import PostModal from './PostModel';
import { draftPost } from '@/store/useStores';
import { createPostAction, createSlot } from '@/lib/actions/post';
import UnscheduleModel from '@/app/(auth)/components/UnscheduleModel';

const CustomButton = ({ icon: Icon, onClick, title, isActive }) => (
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
);

const convertHtmlToText = (html) => {
  if (!html) return '';

  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Remove empty list items
  const emptyListItems = tempDiv.querySelectorAll('li:empty');
  emptyListItems.forEach(item => item.remove());

  // Convert to text with proper formatting
  const processNode = (node) => {
    if (node.nodeType === 3) return node.textContent;

    const tag = node.nodeName.toLowerCase();
    const children = Array.from(node.childNodes).map(processNode).join('');

    switch (tag) {
      case 'br': return '\n';
      case 'p':
      case 'div': return children + '\n';
      case 'strong':
      case 'b': return `**${children}**`;
      case 'em':
      case 'i': return `_${children}_`;
      case 'ul':
        return Array.from(node.children)
          .map(li => `• ${processNode(li).trim()}`)
          .filter(Boolean)
          .join('\n');
      case 'ol':
        return Array.from(node.children)
          .map((li, i) => `${i + 1}. ${processNode(li).trim()}`)
          .filter(Boolean)
          .join('\n');
      case 'li': return children.trim();
      default: return children;
    }
  };

  return Array.from(tempDiv.childNodes)
    .map(processNode)
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export default function TextFormatterClient({ slot, freeSlot }) {
  // New 
  const { date, slottime, id, slot_id, setDraftPost, content } = draftPost();


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
  const [postLoading, setPostLoading] = useState(null);
  const [unschduleModel, setUnscheduleModel] = useState(false);



  // Memoized editor configuration
  const editorConfig = useMemo(() => ({
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
  }), []);

  const editor = useEditor(editorConfig);

  // Memoized selection check
  const hasSelection = useCallback(() => {
    if (!editor) return false;
    const { from, to } = editor.state.selection;
    return from !== to;
  }, [editor]);

  // Memoized format application
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

  // Memoized emoji insertion
  const onEmojiClick = useCallback((emojiObject) => {
    editor?.chain().focus().insertContent(emojiObject.emoji).run();
    setShowEmojiPicker(false);
  }, [editor]);

  // Memoized list sorting
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
        return order === 'asc' ? textA.length - textB.length : textB.length - textA.length;
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

  // Memoized toolbar groups
  const toolbarGroups = useMemo(() => [
    {
      name: 'formatting',
      buttons: [
        { icon: IconBold, action: () => applyFormat('bold', () => editor?.chain().focus().toggleBold().run()), title: 'Bold' },
        { icon: IconItalic, action: () => applyFormat('italic', () => editor?.chain().focus().toggleItalic().run()), title: 'Italic' }
      ]
    },
    {
      name: 'lists',
      buttons: [
        { icon: IconList, action: () => applyFormat('bulletList', () => editor?.chain().focus().toggleBulletList().run()), title: 'Bullet list' },
        { icon: IconListNumbers, action: () => applyFormat('orderedList', () => editor?.chain().focus().toggleOrderedList().run()), title: 'Numbered list' },
        { icon: IconListCheck, action: () => setShowListOptions(!showListOptions), title: 'List options' }
      ]
    },
    {
      name: 'actions',
      buttons: [
        { icon: IconArrowBack, action: () => editor?.chain().focus().undo().run(), title: 'Undo' },
        { icon: IconEyeMinus, action: () => setShowEmojiPicker(!showEmojiPicker), title: 'Emoji' },
        { icon: IconPhoto, action: () => fileInputRef.current?.click(), title: 'Upload image/PDF' }
      ]
    }
  ], [editor, showListOptions, showEmojiPicker, applyFormat]);

  // Handle image upload
  const handleImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setImage(data?.imageUrl);
  }, []);

  // const handlePostNow = () => {
  //   const content = editor.getHTML();
  //   const sanitizedHTML = content.replace(/<li><\/li>/g, '');
  //   const data = convertHtmlToText(sanitizedHTML);
  //   if (!content || content === '<p></p>') {
  //     toast.error('Post is empty!');
  //     return;
  //   }
  //   setPostLoading('post');
  //   const payload = {
  //     content: data,
  //     image: image ?? null,
  //     id: id,
  //   };
  //   createPost('users/create-post', payload, session?.accessToken)
  //     .then((response) => {
  //       const newContent = '';
  //       editor.commands.setContent(newContent);
  //       setImage(null);
  //       setOpenModel(false);
  //       setPostLoading(null);
  //       toast.success(response?.message);
  //     })
  //     .catch((err) => {
  //       toast.error('Failed to create post');
  //     });
  // };

  // const handlSlotPost = () => {
  //   const content = editor.getHTML();
  //   const sanitizedHTML = content.replace(/<li><\/li>/g, '');
  //   const data = convertHtmlToText(sanitizedHTML);
  //   if (!content || content === '<p></p>') {
  //     toast.error('Post is empty!');
  //     return;
  //   }
  //   setPostLoading('slot');

  //   const payload = {
  //     content: data,
  //     is_slot: slot[0]?.id,
  //     image: image ?? null,
  //     id: id
  //   };

  //   createPost('users/create-post', payload, session?.accessToken)
  //     .then((response) => {
  //       const newContent = '';
  //       editor.commands.setContent(newContent);
  //       setOpenModel(false);
  //       setImage(null);
  //       setPostLoading(null);
  //       toast.success(response?.message);
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       toast.error('Failed to create post');
  //     });
  // };

  // const handlSchedulePost = () => {
  //   const content = editor.getHTML();
  //   const sanitizedHTML = content.replace(/<li><\/li>/g, '');
  //   const data = convertHtmlToText(sanitizedHTML);
  //   if (!content || content === '<p></p>') {
  //     toast.error('Post is empty!');
  //     return;
  //   }
  //   setPostLoading('schedule');

  //   const payload = {
  //     content: data,
  //     time: time.split('T')[1],
  //     date: time.split('T')[0],
  //     is_schedule: true,
  //     image: image ?? null,
  //     id: id
  //   };

  //   createPost('users/create-post', payload, session?.accessToken)
  //     .then((response) => {
  //       const newContent = '';
  //       editor.commands.setContent(newContent);
  //       setOpenModel(false);
  //       setImage(null);
  //       setPostLoading(null);
  //       toast.success(response?.message);
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       toast.error('Failed to create post');
  //     });
  // };

  const handlePostNow = async () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);

    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }

    setPostLoading('post');

    const payload = {
      content: data,
      image: image ?? null,
      id: id,
    };

    try {
      const response = await createPostAction(payload, session?.accessToken);
      editor.commands.setContent('');
      setImage(null);
      setOpenModel(false);
      setPostLoading(null);

      if (response.status) {
        toast.success(response.message);
      } else {
        toast.error(response.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    }
  };

  const handlSlotPost = async () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);

    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }

    setPostLoading('slot');

    const payload = {
      content: data,
      is_slot: slot[0]?.id,
      image: image ?? null,
      id: id,
    };

    try {
      const response = await createPostAction(payload, session?.accessToken);
      editor.commands.setContent('');
      setOpenModel(false);
      setImage(null);
      setPostLoading(null);

      if (response.status) {
        toast.success(response.message);
      } else {
        toast.error(response.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    }
  };

  const handlSchedulePost = async () => {
    const content = editor.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);

    if (!content || content === '<p></p>') {
      toast.error('Post is empty!');
      return;
    }

    setPostLoading('schedule');

    const payload = {
      content: data,
      time: time.split('T')[1] ?? slottime,
      date: time.split('T')[0] ?? date,
      is_schedule: true,
      image: image ?? null,
      id: id,
    };

    try {
      const response = await createPostAction(payload, session?.accessToken);
      editor.commands.setContent('');
      setOpenModel(false);
      setImage(null);
      setPostLoading(null);

      if (response.status) {
        toast.success(response.message);
      } else {
        toast.error(response.error || 'Failed to create post');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create post');
    }
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
    if (slottime && date) {
      setTime(`${date}T${slottime}`);
    }
    return setOpenModel(true);
  };

  const testFunction = useCallback(async () => {
    const content = editor?.getHTML();
    const sanitizedHTML = content.replace(/<li><\/li>/g, '');
    const data = convertHtmlToText(sanitizedHTML);
    if (data && data.trim() !== '') {
      if (date && slottime) {
        const reponse = await createSlot(slottime, date, session?.uniid, data, id, slot_id).then((res) => {
          setDraftPost({ id: res?.id, slot_id: res?.slot_id });
          return res;
        });
        console.log('Draft post:', reponse);
      } else {
        const reponse = await createSlot(null, null, session?.uniid, data, id).then((res) => {
          setDraftPost({ id: res?.id });
          return res;
        });
      }
    }
  }, [editor, id, date, slottime, session?.uniid, setDraftPost, slot_id]);

  const debouncedTestFunction = useMemo(
    () => debounce(testFunction, 1000),
    [testFunction]
  );
  useEffect(() => {
    if (editor) {
      const updateHandler = () => {
        debouncedTestFunction();
      };
      editor.on('update', updateHandler);
      return () => {
        editor.off('update', updateHandler);
      };
    }
  }, [editor, debouncedTestFunction]);

  useEffect(() => {
    if (editor) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);
  return (
    <div className="rich-text-container flex gap-5 px-4" style={{ position: 'relative' }}>
      <div className="w-[60%]">
        <div className="editor-toolbar bg-white rounded-xl mb-3 shadow-sm relative flex py-5 px-5 gap-3">
          {toolbarGroups.map((group, index) => (
            <div key={group.name} className={`toolbar-group ${index > 0 ? 'mx-1' : ''}`} style={{ display: 'flex', gap: '10px' }}>
              {group.buttons.map((button) => (
                <div key={button.title} className="bg-white shadow-lg rounded-md flex items-center gap-2 px-1 py-1">
                  <CustomButton
                    icon={button.icon}
                    onClick={button.action}
                    title={button.title}
                    isActive={editor?.isActive(button.title.toLowerCase())}
                  />
                </div>
              ))}
            </div>
          ))}

          {showEmojiPicker && (
            <div style={{ position: 'absolute', zIndex: 1000, top: '100%', left: 0 }}>
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}

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

          <input
            type="file"
            onChange={handleImageUpload}
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,.pdf"
          />
        </div>

        <RichTextEditor editor={editor}>
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
              <button disabled={loading}
                key={action}
                className="relative z-0 rounded bg-blue-800 px-6 py-2 text-white text-sm font-medium transition-all duration-300 after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-0 after:rounded after:bg-blue-900 after:transition-all after:duration-300 hover:after:w-full"
                onClick={() => runApiAndUpdateEditor(action)}
              >
                {label} {activeAction == action && (
                  loading ? '⏳' : ''
                )}
              </button>
            ))}
          </div>
        </div>

        {!slottime ? (
          <div className="editor-footer flex mt-10">
            {(slot[0]?.time || freeSlot?.status) && (
              <button onClick={handlSlotPost} className="relative block group mx-3">
                <span className="absolute inset-0 bg-green-500 rounded-lg transition-all duration-300 group-hover:bg-green-600"></span>
                <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                  <div className="p-2">
                    <p className="text-sm font-outerSans font-medium text-white mb-1">
                      Add to Que {formatDate(new Date())} , {
                        slot[0]?.time
                          ? convertTo12Hour(slot[0]?.time)
                          : `${convertTo12Hour(freeSlot?.data?.time)}`
                      }
                      {postLoading == 'slot' ? "⏳" : ''}
                    </p>
                  </div>
                </div>
              </button>
            )}
            <button onClick={handlSchedulePostModel} className="relative block group mx-3">
              <span className="absolute inset-0 bg-amber-400 rounded-lg transition-all duration-300 group-hover:bg-amber-500"></span>
              <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="p-2">
                  <p className="text-sm font-outerSans font-medium text-white mb-1">
                    Schedule {postLoading == 'schedule' ? "⏳" : ''}
                  </p>
                </div>
              </div>
            </button>

            <button onClick={handlePostNow} className="relative block group mx-3">
              <span className="absolute inset-0 bg-indigo-500 rounded-lg transition-all duration-300 group-hover:bg-indigo-600"></span>
              <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="p-2">
                  <p className="text-sm font-outerSans font-medium text-white mb-1">
                    Post now {postLoading == 'post' ? "⏳" : ''}
                  </p>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex mt-5">
            <button onClick={handlSchedulePostModel} className="relative block group mx-3">
              <span className="absolute inset-0 bg-green-500 rounded-lg transition-all duration-300 group-hover:bg-green-600"></span>
              <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="p-2">
                  <p className="text-sm font-outerSans font-medium text-white mb-1">
                    {slottime && `${formatDate(date)} , ${convertTo12Hour(slottime)}`} {postLoading == 'schedule' ? "⏳" : ''}
                  </p>
                </div>
              </div>
            </button>
            <button onClick={() => setUnscheduleModel(true)} className="relative block group mx-3">
              <span className="absolute inset-0 bg-green-500 rounded-lg transition-all duration-300 group-hover:bg-green-600"></span>
              <div className="px-4 transition bg-black relative border-2 rounded-lg -translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
                <div className="p-2">
                  <p className="text-sm font-outerSans font-medium text-white mb-1">
                    Unschedule?
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}


      </div>
      <div className="my-20">
        {editor && <PostBox image={image} content={editor.getText() ? editor.getHTML() : null} />}
      </div>
      {openModel && <PostModal freeSlot={freeSlot} slot={slot} setOpenModel={setOpenModel} setTime={setTime} time={time} handlePostNow={handlePostNow} handlSchedulePost={handlSchedulePost} handlSlotPost={handlSlotPost} />}
      {unschduleModel && <UnscheduleModel post={{ id: id, slot_id: slot_id }} onClose={() => setUnscheduleModel(false)} />}
    </div>
  );
}