import { getNextFreeSlot } from "@/lib/actions/post";
import { convertTo12Hour, formatDate } from "@/lib/api/user";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function PostModal({ freeSlot, slot, time, setOpenModel, setTime, handlePostNow, handlSchedulePost, handlSlotPost }) {
    const { data: session } = useSession();
    return (
        <>
            <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center" >
                <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-semibold">Schedule</h2>
                        <button className="text-gray-500 hover:text-gray-700">
                        </button>
                        <button onClick={() => setOpenModel(false)}>
                            X
                        </button>
                    </div>

                    {/* <div className="px-4 py-2 text-sm text-gray-600">
                        All times in <span className="bg-gray-200 px-2 py-0.5 rounded">Asia/Kolkata (02:59 PM)</span> timezone
                    </div> */}

                    <div className="px-4 py-2">
                        <input
                            onChange={(e) => setTime(e.target.value)}
                            type="datetime-local"
                            value={time}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                        />
                    </div>

                    {(slot[0]?.time || freeSlot?.status)
                        && (
                            <div className="px-4 py-2 space-y-2">
                                <button onClick={handlSlotPost} className="w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">
                                    → Free slot at {
                                        slot[0]?.time
                                            ? `${formatDate()} on ${convertTo12Hour(slot[0]?.time)}`
                                            : `${convertTo12Hour(freeSlot?.data?.time)} on ${formatDate(freeSlot?.data?.date)}`
                                    }
                                </button>
                                <button onClick={handlePostNow} className="w-full border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">
                                    Post now
                                </button>
                            </div>
                        )
                    }

                    {(time) && (
                        <div className="px-4 py-3">
                            <button onClick={handlSchedulePost} className="w-full bg-orange-500 text-white font-medium rounded-lg py-2 flex items-center justify-center gap-2 hover:bg-orange-600 transition">
                                Confirm {formatDate(time)} at {convertTo12Hour(time?.split('T')[1])}
                            </button>
                        </div>
                    )}


                    <div className="border-t px-4 py-3">
                        <div className="text-sm mb-2">Post with:</div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-500 text-white font-semibold flex items-center justify-center border-2 border-white shadow-md">
                                <Image
                                    src={`${session?.user?.image}`}
                                    alt="User Avatar"
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                    unoptimized
                                />
                            </div>
                            <button className="ml-auto text-sm border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50">
                                + Add company pages
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}