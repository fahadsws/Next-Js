'use client';

import SlotModal from "@/components/layout/SlotModal";
import { useState } from "react";

export default function Slots({ slots }) {
    const [isOpen, setIsOpen] = useState(false);

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

            {isOpen && <SlotModal setIsOpen={setIsOpen} slots={slots} />}
        </>
    );
}
