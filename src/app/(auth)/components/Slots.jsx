'use client';

import SlotModal from "@/components/layout/SlotModal";
import { draftPost } from "@/store/useStores";
import { useState } from "react";
import DeleteModel from "./DeleteModel";
import Posts from "./Posts";
import { convertTo12Hour } from "@/lib/api/user";

export default function Slots({ slots, notPosts, truncateContent }) {
    const { date: storedate, slottime, setDraftPost } = draftPost();
    const [isOpen, setIsOpen] = useState(false);
    const [deleteModel, setDeleteModel] = useState(false);
    const [selectedpost, setSelectedPost] = useState(false);
    const getNext10Days = () => {
        const days = [];
        const today = new Date();
        days.push(today);  // Add today as the first day
        for (let i = 1; i < 10; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    };
    const getDayName = (date) =>
        date.toLocaleDateString('en-US', { weekday: 'long' });

    const getFormattedDate = (date) =>
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });


    const isSlotAvailable = (slot, dayIndex) => {
        return slot.day.split(',').map(Number).includes(dayIndex);
    };

    const handleSlotClick = async (date, slot) => {
        const isoDate = date.toISOString().split('T')[0];
        setDraftPost({ date: isoDate, slottime: slot?.time });
    }
    const handlePostClick = async (post) => {
        setDraftPost({ date: post.slot.date, slottime: post.slot.time, id: post.id, slot_id: post.slot.id, content: post.content });
    }
    return (
        <>
            <div className="mb-2">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full text-white font-semibold py-3 rounded bg-blue-600 hover:bg-blue-700 transition"
                >
                    Add Schedule
                </button>
            </div>

            {notPosts.filter((p) => p.is_slot == 0) && notPosts.length > 0 ? (
                <Posts posts={notPosts.filter((p) => p.is_slot == 0)} truncateContent={truncateContent} />
            ) : (
                <p className="text-sm my-3 bg-red-300 text-black p-3 rounded-lg text-center font-medium">You have no posts scheduled.</p>
            )}

            {/* 
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                {getNext10Days().map((date) => {
                    const dayIndex = date.getDay();
                    const daySlots = slots.filter((slot) => isSlotAvailable(slot, dayIndex));

                    if (daySlots.length === 0) return null;
                    return (
                        <div key={date.toDateString()}>
                            <p className="text-smmb-2 font-mono text-black">
                                {getDayName(date)}{" "}
                                <span className="text-black">{getFormattedDate(date)}</span>
                            </p>
                            {daySlots.map((slot) => {
                                const hour = parseInt(slot.time.slice(0, 2), 10);
                                const isPM = hour >= 12;
                                const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                                const formattedTime = `${hour12}:${slot.time.slice(3)} ${isPM ? "PM" : "AM"}`;

                                const slotDateStr = date.toISOString().split('T')[0];

                                const matchedPost = notPosts?.filter((post) =>
                                    post?.slot &&
                                    post.slot.time === slot.time &&
                                    post.slot.date === slotDateStr
                                );
                                if (matchedPost?.length > 0) {
                                    return matchedPost.map((post, idx) => (
                                        <div onClick={() => handlePostClick(post)}
                                            key={`${slot.id}-${idx}`}
                                            className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                            style={post.slot.time === slottime  ? { borderLeft: '4px solid #3b82f6' } : {}}
                                        >
                                            <div>
                                                <p className="text-sm text-gray-900 my-1">{truncateContent(post.content)}</p>
                                                <p className="text-sm text-gray-500">{formattedTime}</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedPost({ id: post.id, slotId: post.slot.id });
                                                    setDeleteModel(true);
                                                }}
                                                className="p-2 rounded bg-red-200 hover:bg-red-00"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-red-600"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1zm4 1a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                                                        clipRule="evenodd"
                                                    />
                                                    <path d="M4 5a1 1 0 011-1h10a1 1 0 011 1v1H4V5zM5 7h10l-.867 10.142A1 1 0 0113.138 18H6.862a1 1 0 01-.995-.858L5 7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ));
                                }
                                if (date.toDateString() == new Date(storedate).toDateString() && slottime === slot?.time) {
                                    return (
                                        <div
                                            key={`${slot.id}`}
                                            className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                            style={{ borderLeft: '4px solid #3b82f6' }}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-black">NEW</p>
                                                <p className="text-sm text-gray-500">Emty Draft</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={slot.id} className="flex justify-between items-center px-4 py-3 border rounded-md mb-2">
                                        <span className="text-sm text-gray-700">{formattedTime}</span>
                                        <button onClick={() => handleSlotClick(date, slot)} className="text-blue-600 font-medium text-sm hover:text-blue-900">
                                            + New
                                        </button>
                                    </div>
                                );
                            })}



                        </div>
                    );
                })}
            </div> */}
            
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                {getNext10Days().map((date) => {
                    const dayIndex = date.getDay();
                    const daySlots = slots.filter((slot) => isSlotAvailable(slot, dayIndex));

                    if (daySlots.length === 0) return null;

                    // Check if today's slots are already passed
                    const currentTime = new Date();
                    const isToday = date.toDateString() === currentTime.toDateString();

                    // Filter out past slots for today
                    const availableSlots = daySlots.filter((slot) => {
                        const slotTime = new Date(`${date.toISOString().split('T')[0]}T${slot.time}:00`);
                        return currentTime < slotTime; // Only keep slots that haven't passed
                    });

                    // If all slots are in the past, don't render the day
                    if (availableSlots.length === 0) return null;

                    return (
                        <div key={date.toDateString()}>
                            <p className="text-sm mb-2 font-mono text-black">
                                {getDayName(date)}{" "}
                                <span className="text-black">{getFormattedDate(date)}</span>
                            </p>

                            {availableSlots.map((slot) => {
                                const hour = parseInt(slot.time.slice(0, 2), 10);
                                const isPM = hour >= 12;
                                const hour12 = hour % 12 === 0 ? 12 : hour % 12;
                                const formattedTime = `${hour12}:${slot.time.slice(3)} ${isPM ? "PM" : "AM"}`;

                                const slotDateStr = date.toISOString().split('T')[0];

                                const matchedPost = notPosts?.filter((post) =>
                                    post?.slot &&
                                    post.slot.time === slot.time &&
                                    post.slot.date === slotDateStr
                                );
                                if (matchedPost?.length > 0) {
                                    return matchedPost.map((post, idx) => (
                                        <div onClick={() => handlePostClick(post)}
                                            key={`${slot.id}-${idx}`}
                                            className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                            style={post.slot.time === slottime ? { borderLeft: '4px solid #3b82f6' } : {}}
                                        >
                                            <div>
                                                <p className="text-sm text-gray-900 my-1">{truncateContent(post.content)}</p>
                                                <p className="text-sm text-gray-500">{formattedTime}</p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setSelectedPost({ id: post.id, slotId: post.slot.id });
                                                    setDeleteModel(true);
                                                }}
                                                className="p-2 rounded bg-red-200 hover:bg-red-00"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-4 w-4 text-red-600"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1zm4 1a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                                                        clipRule="evenodd"
                                                    />
                                                    <path d="M4 5a1 1 0 011-1h10a1 1 0 011 1v1H4V5zM5 7h10l-.867 10.142A1 1 0 0113.138 18H6.862a1 1 0 01-.995-.858L5 7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    ));
                                }

                                if (date.toDateString() === new Date(storedate).toDateString() && slottime === slot?.time) {
                                    return (
                                        <div
                                            key={`${slot.id}`}
                                            className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                            style={{ borderLeft: '4px solid #3b82f6' }}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-black">NEW</p>
                                                <p className="text-sm text-gray-500">Empty Draft</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={slot.id} className="flex justify-between items-center px-4 py-3 border rounded-md mb-2">
                                        <span className="text-sm text-gray-700">{formattedTime}</span>
                                        <button onClick={() => handleSlotClick(date, slot)} className="text-blue-600 font-medium text-sm hover:text-blue-900">
                                            + New
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>

            {/* <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                {getNext10Days().map((date) => {
                    const dayOfWeek = (new Date().getDay() || 0); // Convert Sunday (0) to 7
                    const isTodayInString = '1,2,3,4,5'.includes(dayOfWeek.toString());
       
                    return (
                        <div key={date}>
                            <p className="text-sm mb-2 font-mono text-black">
                                {getDayName(date)}{" "}
                                <span className="text-black">{getFormattedDate(date)}</span>
                            </p>

                            {notPosts.map((slot) => {
                                console.log(slot, 'slot')
                                if (slot?.date === date.toISOString().split('T')[0]) {
                                    if (slot?.id) {
                                        return (
                                            <div key={`${Math.random()}`}
                                                onClick={() => handlePostClick(slot?.post)}
                                                className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                                style={slot?.time === slottime ? { borderLeft: '4px solid #3b82f6' } : {}}
                                            >
                                                <div>
                                                    <p className="text-sm text-gray-900 my-1">
                                                        {truncateContent(slot?.content)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {convertTo12Hour(slot?.time)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => {
                                                        setSelectedPost({ id: slot.id, slotId: slot.is_slot });
                                                        setDeleteModel(true);
                                                    }}
                                                    className="p-2 rounded bg-red-200 hover:bg-red-00"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4 text-red-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1zm4 1a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                                                            clipRule="evenodd"
                                                        />
                                                        <path
                                                            d="M4 5a1 1 0 011-1h10a1 1 0 011 1v1H4V5zM5 7h10l-.867 10.142A1 1 0 0113.138 18H6.862a1 1 0 01-.995-.858L5 7z"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        );
                                    }
                                }
                                if ((!slot?.id && slot?.day == null) && date.toDateString() === new Date(storedate).toDateString() && slot?.time === slottime) {
                                    return (
                                        <div key={`${Math.random()}`}
                                            className="flex items-center justify-between border rounded-md mb-2 bg-white p-3 shadow-sm"
                                            style={{ borderLeft: '4px solid #3b82f6' }}
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-black">NEW</p>
                                                <p className="text-sm text-gray-500">Empty Draft</p>
                                            </div>
                                        </div>
                                    );
                                }
                                if (!slot?.id && slot?.date == null) {
                                    return (
                                        <div key={`${Math.random()}`}
                                            className="flex justify-between items-center px-4 py-3 border rounded-md mb-2"
                                        >
                                            <span className="text-sm text-gray-700">{convertTo12Hour(slot?.time)}</span>
                                            <button
                                                onClick={() => handleSlotClick(date, slot)}
                                                className="text-blue-600 font-medium text-sm hover:text-blue-900"
                                            >
                                                + New
                                            </button>
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    );
                })}
            </div> */}




            {isOpen && <SlotModal setIsOpen={setIsOpen} slots={slots} />}
            {deleteModel && <DeleteModel
                tittle={'Delete post'}
                desc={'Are you sure you want to delete your scheduled post?'}
                color={'red'}
                post={selectedpost}
                onClose={() => setDeleteModel(false)}
            />}
        </>
    );
}