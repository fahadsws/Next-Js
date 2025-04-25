'use client';

import SlotModal from "@/components/layout/SlotModal";
import { useState } from "react";

export default function Slots({ slots }) {
    const [isOpen, setIsOpen] = useState(false);
    const getNext10Days = () => {
        const days = [];
        const today = new Date();
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
    return (
        <>
            <div className="mb-4">
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full text-white font-semibold py-3 rounded bg-blue-600 hover:bg-blue-700 transition"
                >
                    Add Schedule
                </button>
            </div>

            {/* <div className="space-y-6 overflow-y-auto flex-1 pr-2">
                <div>
                    <p className="text-sm text-gray-500 mb-2">
                        Friday <span className="text-gray-400">Apr 25</span>
                    </p>
                    {['11:00 AM', '03:00 PM'].map((time) => (
                        <div
                            key={time}
                            className="flex justify-between items-center px-4 py-3 border rounded-md mb-2"
                        >
                            <span className="text-sm text-gray-700">{time}</span>
                            <button className="text-blue-600 font-medium text-sm hover:underline">
                                + New
                            </button>
                        </div>
                    ))}
                </div>

                <div>
                    <p className="text-sm text-gray-500 mb-2">
                        Monday <span className="text-gray-400">Apr 28</span>
                    </p>
                    {['11:00 AM', '03:00 PM'].map((time) => (
                        <div
                            key={time}
                            className="flex justify-between items-center px-4 py-3 border rounded-md mb-2"
                        >
                            <span className="text-sm text-gray-700">{time}</span>
                            <button className="text-blue-600 font-medium text-sm hover:underline">
                                + New
                            </button>
                        </div>
                    ))}
                </div>
            </div> */}

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
                                return (
                                    <div
                                        key={slot.id}
                                        className="flex justify-between items-center px-4 py-3 border rounded-md mb-2"
                                    >
                                        <span className="text-sm text-gray-700">{formattedTime}</span>
                                        <button className="text-blue-600 font-medium text-sm hover:text-blue-900">
                                            + New
                                        </button>
                                    </div>
                                );
                            })}


                        </div>
                    );
                })}
            </div>

            {isOpen && <SlotModal setIsOpen={setIsOpen} slots={slots} />}
        </>
    );
}
