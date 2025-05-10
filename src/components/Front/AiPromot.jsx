import { streamAIResponse } from "@/lib/actions/ai";
import { draftPost } from "@/store/useStores";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function AiPromot({ editor }) {
    const { setDraftPost } = draftPost();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeAction, setActiveAction] = useState(null);
    const [aiOutput, setAiOutput] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [controller, setController] = useState(null);

    const aiMenuRef = useRef(null); 

    const aiOptions = [
        { label: 'Continue writing', type: 'continue', icon: '✍️' },
        { divider: 'Improve with AI' },
        { label: 'Improve writing', type: 'improve', icon: '📝' },
        { label: 'Fix grammar', type: 'grammar', icon: '🧹' },
        { label: 'Make shorter', type: 'shorter', icon: '📉' },
        { label: 'Make longer', type: 'longer', icon: '📈' },
        { label: 'Rewrite in a positive tone', type: 'positive', icon: '😊' },
        { label: 'Simplify text', type: 'simplify', icon: '🔍' },
        { label: 'Add a hook', type: 'hook', icon: '🎣' },
        { label: 'Add a CTA', type: 'cta', icon: '📢' },
        { label: 'Add an emoji', type: 'emoji', icon: '😀' },
        { label: 'Add concrete examples', type: 'examples', icon: '📚' },
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (aiMenuRef.current && !aiMenuRef.current.contains(event.target)) {
                setOpen(false);
                setAiOutput('');
            }
        };

        if (open || aiOutput) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open, aiOutput]);

    const handleAiAssist = (type) => {
        const content = editor.getText();
        if (!content || content === '<p></p>') return toast.error('Post is empty!');

        setLoading(true);
        setActiveAction(type);
        setAiOutput('');
        const abortController = new AbortController();
        setController(abortController);
        let streamedText = '';

        streamAIResponse({
            inputText: content,
            type,
            onChunk: (chunk) => {
                streamedText += chunk;
                setAiOutput(streamedText);
            },
            signal: abortController.signal,
        })
            .then(() => toast.success('AI response ready!'))
            .catch((err) => {
                if (err.name === 'AbortError') {
                    toast('AI generation stopped.');
                } else {
                    toast.error('AI generation failed');
                    console.error(err);
                }
            })
            .finally(() => {
                setLoading(false);
                setController(null);
            });
    };

    const handleAiAssistCustom = (customText) => {
        setLoading(true);
        setAiOutput('');
        const abortController = new AbortController();
        setController(abortController);
        let streamedText = '';

        streamAIResponse({
            inputText: customText,
            type: activeAction || 'continue',
            onChunk: (chunk) => {
                streamedText += chunk;
                setAiOutput(streamedText);
            },
            signal: abortController.signal,
        })
            .then(() => toast.success('AI response ready!'))
            .catch((err) => {
                if (err.name === 'AbortError') {
                    toast('AI generation stopped.');
                } else {
                    toast.error('AI generation failed');
                }
            })
            .finally(() => {
                setLoading(false);
                setController(null);
            });
    };

    return (
        <div ref={aiMenuRef} className="relative inline-block text-left my-5">
            {/* Trigger Button */}
            <button
                onClick={() => {
                    setOpen(!open);
                    setAiOutput('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 flex items-center gap-2 text-sm transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 21l15 -15l-3 -3l-15 15l3 3" />
                    <path d="M15 6l3 3" />
                    <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                    <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                </svg>
                {loading ? "Loading..." : "AI Assist"}
            </button>

            {/* AI Options */}
            {open && !aiOutput && (
                <div className="absolute mt-2 right-0 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm overflow-y-auto max-h-50">
                    <div className="border-b px-4 py-2 text-xs text-gray-400 font-semibold">
                        Write with AI
                    </div>
                    {aiOptions.map((option, index) =>
                        option.divider ? (
                            <div key={index} className="px-4 py-2 text-xs text-gray-400 font-semibold border-t">
                                {option.divider}
                            </div>
                        ) : (
                            <button
                                key={index}
                                onClick={() => handleAiAssist(option.type)}
                                className={`w-full text-left px-4 py-2 flex items-center gap-2 transition hover:bg-gray-100 ${activeAction === option.type ? 'bg-gray-100 text-blue-600 font-semibold' : ''
                                    }`}
                            >
                                <span>{option.icon}</span> {option.label}
                            </button>
                        )
                    )}
                </div>
            )}

            {/* AI Output + Actions */}
            {aiOutput && (
                <div className="absolute mt-2 right-0 w-96 bg-white border border-gray-200 rounded-md shadow-lg z-50 text-sm p-4 space-y-4">
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap text-gray-800">
                        {aiOutput}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => {
                                setDraftPost({ content: aiOutput });
                                setAiOutput('');
                                setOpen(false);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                        >
                            Replace
                        </button>
                        <button
                            onClick={() => {
                                const existingContent = editor.getText();
                                const newContent = `${existingContent}\n\n---\n\n${aiOutput}`;
                                setDraftPost({ content: newContent });
                                editor.commands.setContent(newContent);
                                setAiOutput('');
                                setOpen(false);
                            }}
                            className="px-3 py-1 bg-purple-600 text-white rounded text-xs"
                        >
                            Insert Below
                        </button>
                        <button
                            onClick={() => handleAiAssist(activeAction)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded text-xs"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigator.clipboard.writeText(aiOutput)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs"
                        >
                            Copy
                        </button>
                        <button
                            onClick={() => {
                                setAiOutput('');
                                setCustomInput('');
                            }}
                            className="px-3 py-1 bg-gray-400 text-white rounded text-xs"
                        >
                            Discard
                        </button>
                    </div>

                    <div className="flex gap-2 items-center">
                        <input
                            type="text"
                            placeholder="Send follow-up..."
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && customInput.trim() && !loading) {
                                    handleAiAssistCustom(customInput.trim());
                                    setCustomInput('');
                                }
                            }}
                            className="flex-1 border rounded px-3 py-1 text-sm"
                        />
                        {!loading ? (
                            <button
                                onClick={() => {
                                    if (customInput.trim()) {
                                        handleAiAssistCustom(customInput.trim());
                                        setCustomInput('');
                                    }
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded text-xs"
                            >
                                Send
                            </button>
                        ) : (
                            <button
                                onClick={() => controller?.abort()}
                                className="px-3 py-1 bg-red-500 text-white rounded text-xs"
                            >
                                Stop
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}