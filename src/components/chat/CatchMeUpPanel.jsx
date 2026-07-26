import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { summarizeRoomApi } from "../../services/AiService";
import useChatContext from "../../context/ChatContext";
import toast from "react-hot-toast";

const CatchMeUpPanel = ({ roomId }) => {
    const { catchUpSnapshot } = useChatContext();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || !catchUpSnapshot || catchUpSnapshot.count === 0) return null;

    const handleCatchMeUp = async () => {
        setLoading(true);
        try {
            const data = await summarizeRoomApi(roomId, catchUpSnapshot.since);
            setSummary(data.summary);
        } catch (error) {
            if (error?.response?.status === 429) {
                toast.error(error.response.data || "You've hit the AI request limit \u2014 try again shortly");
            } else {
                toast.error("Could not generate a summary right now");
            }
        } finally {
            setLoading(false);
        }
    };

    if (summary) {
        return (
            <div className="mx-6 mt-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-500/10 p-4 relative">
                <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">AI Summary</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">{summary}</p>
            </div>
        );
    }

    return (
        <div className="mx-6 mt-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-indigo-900 dark:text-indigo-200">
                    You have {catchUpSnapshot.count} unread message{catchUpSnapshot.count === 1 ? "" : "s"}.
                </span>
            </div>
            <button onClick={handleCatchMeUp} disabled={loading} className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg px-3 py-1.5 transition-colors">
                {loading ? "Summarizing..." : "Catch Me Up"}
            </button>
        </div>
    );
};

export default CatchMeUpPanel;