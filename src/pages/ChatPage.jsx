import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Paperclip, Search, Plus, ArrowLeft, Sparkles } from "lucide-react";
import useChatContext from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { baseURL } from "../services/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages, getMyRoomsApi, markAsReadApi } from "../services/RoomService";
import { timeAgo } from "../config/helper";
import DeliveryTicks from "../components/chat/DeliveryTicks";
import RoomModal from "../components/RoomModal";
import TypingIndicator from "../components/chat/TypingIndicator";

const AVATAR_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-sky-500"];
const colorForName = (name = "") => {
    const hash = [...name].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};
const initialsForName = (name = "?") => name.trim().charAt(0).toUpperCase();

const ChatPage = () => {
    const { roomId, currentUser, connected, setConnected, setRoomId } = useChatContext();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [typingUsers, setTypingUsers] = useState({});
    const [onlineUsers, setOnlineUsers] = useState([]);
    const typingTimeoutRef = useRef(null);
    const typingClearTimersRef = useRef({});

    useEffect(() => {
        if (!connected) navigate("/");
    }, [connected]);

    const [messages, setMessages] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [input, setInput] = useState("");
    const [stompClient, setStompClient] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const chatBoxRef = useRef(null);

    const activeRoom = useMemo(() => rooms.find(r => r.roomId === roomId), [rooms, roomId]);

    // sidebar room list
    useEffect(() => {
        getMyRoomsApi().then(setRooms).catch(() => {});
    }, [roomId]);

    // load history for the active room, reset on room switch
    useEffect(() => {
        async function loadMessages() {
            try {
                setMessages([]);
                const data = await getMessages(roomId);
                setMessages(data);
                markAsReadApi(roomId).catch(() => {});
            } catch (error) {}
        }
        if (connected && roomId) loadMessages();
    }, [roomId]);

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({ top: chatBoxRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [messages]);

    // open (and cleanly close) the STOMP connection per active room
    useEffect(() => {
        if (!connected || !roomId) return;

        const sock = new SockJS(`${baseURL}/chat`);
        const client = Stomp.over(sock);

        client.connect(
            { Authorization: `Bearer ${localStorage.getItem("token")}` },
            () => {
                setStompClient(client);
                client.subscribe(`/topic/room/${roomId}`, (msg) => {
                    const newMessage = JSON.parse(msg.body);
                    setMessages((prev) => [...prev, newMessage]);
                    markAsReadApi(roomId).catch(() => {});

                    if (newMessage.sender !== currentUser) {
                        client.send(`/app/ack/${roomId}`, {}, JSON.stringify({ messageId: newMessage.id }));
                    }
                });

                client.subscribe(`/topic/room/${roomId}/status`, (statusMsg) => {
                    const update = JSON.parse(statusMsg.body);
                    if (update.messageId) {
                        setMessages((prev) => prev.map(m =>
                            m.id === update.messageId ? { ...m, status: update.status } : m
                        ));
                    } else if (update.readUpTo) {
                        setMessages((prev) => prev.map(m =>
                            (m.sender === currentUser && new Date(m.timestamp) <= new Date(update.readUpTo))
                                ? { ...m, status: "SEEN" } : m
                        ));
                    }
                });

                client.subscribe(`/topic/room/${roomId}/typing`, (msg) => {
                const event = JSON.parse(msg.body);
                if (event.sender === currentUser) return; // ignore our own echoed event

                setTypingUsers((prev) => {
                    const updated = { ...prev };
                    event.typing ? (updated[event.sender] = true) : delete updated[event.sender];
                    return updated;
                });

                clearTimeout(typingClearTimersRef.current[event.sender]);
                if (event.typing) {
                    // safety net: force-clear if a "stop typing" event never arrives (e.g. tab closed)
                    typingClearTimersRef.current[event.sender] = setTimeout(() => {
                        setTypingUsers((prev) => {
                            const updated = { ...prev };
                            delete updated[event.sender];
                            return updated;
                        });
                    }, 5000);
                }
            });

            client.subscribe(`/topic/room/${roomId}/presence`, (msg) => {
                setOnlineUsers(JSON.parse(msg.body));
            });
            },
            () => toast.error("Connection failed \u2014 check your session")
        );

        return () => {
            if (client && client.connected) client.disconnect();
        };
    }, [roomId]);

   const sendMessage = () => {
        if (stompClient && connected && input.trim()) {
            stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify({ sender: currentUser, content: input, roomId }));
            setInput("");
            clearTimeout(typingTimeoutRef.current);
            stompClient.send(`/app/typing/${roomId}`, {}, JSON.stringify({ typing: false }));
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (stompClient?.connected) {
            stompClient.send(`/app/typing/${roomId}`, {}, JSON.stringify({ typing: true }));
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                stompClient.send(`/app/typing/${roomId}`, {}, JSON.stringify({ typing: false }));
            }, 2000);
        }
    };

    const switchRoom = (newRoomId) => {
        if (newRoomId !== roomId) setRoomId(newRoomId);
    };

    const exitChat = () => {
        setConnected(false);
        setRoomId("");
        navigate("/");
    };

    return (
        <div className="h-screen flex bg-slate-50 dark:bg-slate-950">

            {/* Sidebar */}
            <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <button onClick={exitChat} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            placeholder="Search rooms"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                <div className="p-3">
                    <button
                        onClick={() => setModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Create Room
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {rooms.map((room) => (
                        <button
                            key={room.roomId}
                            onClick={() => switchRoom(room.roomId)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-slate-100 dark:border-slate-800/60 transition-colors ${
                                room.roomId === roomId ? "bg-indigo-50 dark:bg-indigo-500/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                            }`}
                        >
                            <div className={`h-9 w-9 rounded-full ${colorForName(room.name)} flex items-center justify-center text-white text-sm font-semibold shrink-0`}>
                                {initialsForName(room.name)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{room.name}</p>
                                    {room.unreadCount > 0 && (
                                        <span className="h-5 min-w-5 px-1 rounded-full bg-indigo-600 text-white text-[10px] font-semibold flex items-center justify-center">
                                            {room.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {room.lastMessageSender ? `${room.lastMessageSender}: ${room.lastMessageContent}` : "No messages yet"}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>

            {/* Chat panel */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between"> 
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${colorForName(activeRoom?.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                            {initialsForName(activeRoom?.name)}
                        </div>
                        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {activeRoom?.name || roomId}
                        </h1>
                        {onlineUsers.length > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                {onlineUsers.length} online
                            </span>
                        )}
                    </div>
                    <button disabled title="Coming soon" className="flex items-center gap-1.5 text-sm text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 cursor-not-allowed">
                        <Sparkles className="h-4 w-4" /> AI Summary
                    </button>
                </header>
               
                <main ref={chatBoxRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                    {messages.map((message, index) => {
                        const isOwn = message.sender === currentUser;
                        return (
                            <div key={message.id ?? index} className={`flex gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
                                {!isOwn && (
                                    <div className={`h-8 w-8 rounded-full ${colorForName(message.sender)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                                        {initialsForName(message.sender)}
                                    </div>
                                )}
                                <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2 ${
                                    isOwn ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                                }`}>
                                    {!isOwn && <p className="text-xs font-semibold mb-0.5 opacity-70">{message.sender}</p>}
                                    <p className="text-sm">{message.content}</p>
                                    
                                    <div className={`flex items-center gap-1 mt-1 justify-end text-[10px] ${isOwn ? "text-indigo-200" : "text-slate-400"}`}>
                                        <span>{timeAgo(message.timestamp)}</span>
                                        {isOwn && <DeliveryTicks status={message.status} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </main>
                     <TypingIndicator typingUsers={typingUsers} />
                <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <button className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <Paperclip className="h-5 w-5" />
                        </button>
                        <input
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Write a message..."
                            className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button disabled title="Coming soon" className="hidden sm:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-2 cursor-not-allowed shrink-0">
                            <Sparkles className="h-3.5 w-3.5" /> AI Fix
                        </button>
                        <button onClick={sendMessage} className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <RoomModal isOpen={modalOpen} initialMode="create" onClose={() => setModalOpen(false)} />
        </div>
    );
};

export default ChatPage;
