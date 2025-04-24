import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FaHeart, FaRegCommentDots, FaRetweet, FaPaperPlane } from 'react-icons/fa';

export default function PostBox({ content, image }) {
  const { data: session } = useSession();
  return (
    <div className="flex justify-center items-start">
      <div className="bg-white rounded-xl w-full max-w-xl p-4 shadow-sm border border-gray-200">

        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center text-lg font-semibold">
            <Image
              src={`${session?.user?.image}`}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span className="font-medium">{session?.user?.name}</span>
              <span>•</span>
              <span className="text-gray-500">Student at Harvard University</span>
              <span>•</span>
              <span className="text-gray-500">12h</span>
              <span>•</span>
              <span className="text-gray-400 text-xs">🌐</span>
            </div>

            {content ? (
              <div
                className="mt-3 prose max-w-none text-gray-800"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="mt-2 text-sm text-gray-800">
                <p>Start writing and your post will appear here..</p>
                <p className="mt-2">
                  You can add images, links, <span className="text-blue-600 font-semibold">#hashtags</span> and emojis <span>😍</span>
                  <span className="text-blue-600 ml-1 cursor-pointer">…more</span>
                </p>
                <p className="mt-2 text-gray-500">This line will appear below the more...</p>
              </div>
            )}

            {image && (
              <div className="mt-3">
                <Image
                  src={image}
                  alt="Post Image"
                  width={200}
                  height={150}
                  className="rounded-lg"
                />
              </div>
            )}



            <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <span className="text-blue-600">🔵</span>
                <span className="text-red-500"><FaHeart /></span>
                <span className="ml-1">57</span>
              </div>
              <div>
                <span className="mr-4">24 comments</span>
                <span>6 reposts</span>
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div className="flex justify-around text-gray-600 text-sm">
              <button className="flex items-center space-x-1 hover:text-black">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2"
                  viewBox="0 0 24 24"><path d="M14 9l-2 2-2-2" /></svg>
                <span>Like</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-black">
                <FaRegCommentDots className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-black">
                <FaRetweet className="w-4 h-4" />
                <span>Repost</span>
              </button>
              <button className="flex items-center space-x-1 hover:text-black">
                <FaPaperPlane className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
