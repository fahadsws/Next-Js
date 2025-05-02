import { create } from 'zustand';

export const draftPost = create((set) => ({
    date: '',
    slottime: '',
    id: null,
    slot_id: 0,
    content: '',
    setDraftPost: (data) => set((state) => ({ ...state, ...data })),
}));

// setDraftPost({ date: '2025-04-29', time: '13:30', id: 'xyz123' });