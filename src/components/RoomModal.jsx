import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";

const RoomModal = ({ isOpen, initialMode = "join", onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [roomId, setRoomIdInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  // reset the form and sync the active tab every time the modal (re)opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setRoomIdInput("");
      setRoomName("");
    }
  }, [isOpen, initialMode]);

  // lock background scroll while open, allow Escape to close
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const enterRoom = (id) => {
    setCurrentUser(user?.displayName);
    setRoomId(id);
    setConnected(true);
    onClose();
    navigate("/chat");
  };

  const handleJoin = async () => {
    if (!roomId.trim()) return toast.error("Enter a room code");
    setLoading(true);
    try {
      const room = await joinChatApi(roomId.trim());
      toast.success("Joined!");
      enterRoom(room.roomId);
    } catch (error) {
      toast.error(error?.response?.status === 400 ? error.response.data : "Error joining room");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!roomName.trim() || !roomId.trim()) return toast.error("Enter both a room name and a room code");
    setLoading(true);
    try {
      const room = await createRoomApi({ roomId: roomId.trim(), name: roomName.trim() });
      toast.success("Room created!");
      enterRoom(room.roomId);
    } catch (error) {
      toast.error(error?.response?.status === 400 ? "Room code already exists" : "Error creating room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {mode === "join" ? "Join a Room" : "Create a Room"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {mode === "join" ? "Enter the room code your team shared with you." : "Give your room a name and a shareable code."}
        </p>

        <div className="flex mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
          <button
            onClick={() => setMode("join")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "join" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Join Room
          </button>
          <button
            onClick={() => setMode("create")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "create" ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            Create Room
          </button>
        </div>

        <div className="space-y-4">
          {mode === "create" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Name</label>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                type="text"
                placeholder="e.g. Design Team"
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Room Code</label>
            <input
              value={roomId}
              onChange={(e) => setRoomIdInput(e.target.value)}
              type="text"
              placeholder={mode === "join" ? "Enter the room code" : "Choose a unique code"}
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={mode === "join" ? handleJoin : handleCreate}
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Please wait..." : mode === "join" ? "Join Room" : "Create Room"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomModal;