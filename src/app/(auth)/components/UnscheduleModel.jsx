import { deletePost } from "@/lib/actions/post";
import { draftPost } from "@/store/useStores";
import toast from "react-hot-toast";

export default function UnscheduleModel({ onClose, post }) {
    const { content, setDraftPost } = draftPost();
    const handelDelete = async () => {
        const res = await deletePost(post.id, post.slot_id).then((res) => {
            setDraftPost({ date: '', slottime: '', id: null, slot_id: 0, content: '' });
            onClose();
            toast.success("Post Unschedule successfully");
        });
    }
    return (
        <>
            <div className="fixed inset-0 bg-black/80 bg-opacity-30 flex items-center justify-center z-50 ">
                <div className="bg-white rounded-md shadow-lg w-full max-w-md p-6 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-black"
                    >
                        x
                    </button>
                    <h2 className="text-xl font-semibold text-black mb-2">Unschedule post</h2>
                    <p className="text-gray-700 mb-6">
                        Once unscheduled, a post will be no longer in the queue. If you want to schedule it again, you can do it from the drafts.
                    </p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handelDelete}
                            className={`px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600`}
                        >
                            Yes, Unschedule now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
