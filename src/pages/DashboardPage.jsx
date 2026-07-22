import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {Sparkles, LayoutDashboard, MessageSquare, Settings, User,Search, Plus, LogIn, LogOut, Users} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyRoomsApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import toast from "react-hot-toast";

const formatTimeAgo = (isoString) => {
    if (!isoString) return "";
    const mins = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? "Yesterday" : `${days}d ago`;
};

const DashboardPage = () => {
    const { user, logout } = useAuth();
    const { setRoomId, setCurrentUser, setConnected } = useChatContext();
    const navigate = useNavigate();

    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setRooms(await getMyRoomsApi());
            } catch {
                toast.error("Could not load your rooms");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filteredRooms = useMemo(() => {
        if (!search.trim()) return rooms;
        const q = search.toLowerCase();
        return rooms.filter(r =>
            r.name?.toLowerCase().includes(q) || r.lastMessageContent?.toLowerCase().includes(q)
        );
    }, [rooms, search]);

    const enterRoom = (room) => {
        setRoomId(room.roomId);
        setCurrentUser(user?.displayName);
        setConnected(true);
        navigate("/chat");
    };

    const initial = user?.displayName?.charAt(0)?.toUpperCase() || "?";

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
            <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 px-5 py-5">
                        <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-wide text-slate-900 dark:text-slate-100">SYNORA</p>
                            <p className="text-xs text-slate-400">Workspace hub</p>
                        </div>
                    </div>

                    <nav className="px-3 space-y-1">
                        <button className="w-full flex items-center gap-2 rounded-lg bg-indigo-600 text-white text-sm font-medium px-3 py-2">
                            <LayoutDashboard className="h-4 w-4" /> Dashboard
                        </button>
                        <button className="w-full flex items-center gap-2 rounded-lg text-slate-600 dark:text-slate-300 text-sm px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <MessageSquare className="h-4 w-4" /> My Rooms
                        </button>
                        <button disabled title="Coming soon" className="w-full flex items-center gap-2 rounded-lg text-slate-400 text-sm px-3 py-2 cursor-not-allowed">
                            <Sparkles className="h-4 w-4" /> AI Assistant
                        </button>
                        <button disabled title="Coming soon" className="w-full flex items-center gap-2 rounded-lg text-slate-400 text-sm px-3 py-2 cursor-not-allowed">
                            <Settings className="h-4 w-4" /> Settings
                        </button>
                    </nav>
                </div>

                <div className="relative px-3 pb-4">
                    <button onClick={() => setMenuOpen(v => !v)} className="w-full flex items-center gap-2 rounded-lg text-slate-600 dark:text-slate-300 text-sm px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <User className="h-4 w-4" /> {user?.displayName || "Profile"}
                    </button>
                    {menuOpen && (
                        <div className="absolute bottom-14 left-3 right-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
                            <button onClick={logout} className="w-full flex items-center gap-2 text-sm text-red-600 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-500/10">
                                <LogOut className="h-4 w-4" /> Log out
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 p-8">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                            Welcome back, {user?.displayName || "there"}
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Your rooms are active and ready for the next conversation.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search rooms"
                                className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                            />
                        </div>
                        <div className="h-9 w-9 rounded-full bg-indigo-600 text-white text-sm font-semibold flex items-center justify-center">
                            {initial}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate("/join")} className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 transition-colors">
                        <Plus className="h-4 w-4" /> Create Room
                    </button>
                    <button onClick={() => navigate("/join")} className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <LogIn className="h-4 w-4" /> Join Room
                    </button>
                </div>

                {loading ? (
                    <p className="text-sm text-slate-400">Loading your rooms...</p>
                ) : filteredRooms.length === 0 ? (
                    <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            {rooms.length === 0 ? "You haven't joined any rooms yet — create or join one to get started." : "No rooms match your search."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredRooms.map((room) => (
                            <button
                                key={room.roomId}
                                onClick={() => enterRoom(room)}
                                className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{room.name}</h3>
                                    {room.unreadCount > 0 && (
                                        <span className="h-6 min-w-6 px-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center">
                                            {room.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {room.lastMessageSender && (
                                        <span className="font-medium text-slate-600 dark:text-slate-300">{room.lastMessageSender}: </span>
                                    )}
                                    {room.lastMessageContent || "No messages yet"}
                                </p>
                                <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-3.5 w-3.5" />
                                        {room.memberCount} member{room.memberCount === 1 ? "" : "s"}
                                    </span>
                                    <span>{formatTimeAgo(room.lastMessageAt || room.createdAt)}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DashboardPage;