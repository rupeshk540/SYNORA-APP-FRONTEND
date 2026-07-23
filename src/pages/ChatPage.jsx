import { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import {baseURL} from "../services/AxiosHelper";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { getMessages, markAsReadApi } from "../services/RoomService";
import { timeAgo } from "../config/helper";



const ChatPage = () => {
    const{roomId,currentUser,connected,setConnected,setRoomId,setCurrentUser} = useChatContext();
    const navigate = useNavigate();
    useEffect(()=>{
       if(!connected){
         navigate("/");
       }
    },[connected,roomId,currentUser]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [ stompClient, setStompClient] = useState(null);

    //page init 
    //message ko load krna hoga
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessages(roomId);
                setMessages(messages);
                markAsReadApi(roomId).catch(() => {}); // best-effort, never blocks the chat UI
            } catch (error) {}
        }
        if (connected) {
            loadMessages();
        }
    }, []);
    
    //scroll up
    useEffect(()=> {
        if(chatBoxRef.current){
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior:"smooth",
            });
        }
    },[messages]);
    
    //stompClient ko init karne honge
    //subscribe
    useEffect(()=>{

        const connectWebSocket = () => {
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);

            client.connect(
                { Authorization: `Bearer ${localStorage.getItem("token")}` },
                () => {
                    setStompClient(client);
                    toast.success("connected");
                    client.subscribe(`/topic/room/${roomId}`, (messages) => {
                    const newMessage = JSON.parse(messages.body);
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
                                ? { ...m, status: "SEEN" }
                                : m
                        ));
                    }
                });
                },
                (error) => {
                    toast.error("Connection failed — check your session");
                    console.error("STOMP connect error:", error);
                }
            );
        };
        if(connected){
            connectWebSocket();
        }
    },[roomId])

    //send message handle
    const sendMessage = async()=>{
        if(stompClient && connected && input.trim()){
            const message={
                sender:currentUser,
                content:input,
                roomId:roomId
            }

            stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message));
            setInput("");
        }
    };

    function handleLogOut(){
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("")
        navigate("/");
    }

  return (
   <div>
    {/* Header section */}
        <header className="dark:border-gray-700 fixed w-full border dark:bg-gray-900 py-5 shadow flex justify-around items-center">
            {/* room name div*/}
            <div>
                <h1 className="text-xl font-semibold">
                    Room : <span>{roomId}</span>
                </h1>
            </div>

            {/* username div */}
            <div>
                <h1 className="text-xl font-semibold">
                    User : <span>{currentUser}</span>
                </h1>
            </div>

            {/* leave button div */}
            <div>
                <button onClick={handleLogOut} className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded">Leave Room</button>
            </div>
        </header>


    {/* main chat section */}
    <main ref={chatBoxRef} className="py-20 px-10 w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto">
       {messages.map((message,index) => (
            <div  key={index} className={`flex ${message.sender==currentUser? "justify-end" : "justify-start"} `} >
                <div className={`my-2 ${message.sender === currentUser ? 'bg-blue-900':'bg-gray-900'}  p-2 max-w-xs rounded`}>
                    <div className="flex flex-row gap-2">
                        <img className="h-10 w-10" src={`${message.sender===currentUser?'https://avatar.iran.liara.run/public/boy':'https://avatar.iran.liara.run/public'}`} alt="" />
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold">{message.sender}</p>
                            <p>{message.content}</p>
                            {message.sender === currentUser && (
                                <DeliveryTicks status={message.status} />
                            )}
                            <p className="text-xs text-gray-400">{timeAgo(message.timeStamp)}</p>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </main>

    {/* input meassage section */}
        <div className="fixed bottom-4 w-full h-16">
            <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
                <input 
                    value={input}
                    onChange={(e)=> {
                        setInput(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if(e.key === "Enter"){
                            sendMessage();
                        }
                    }}
                    type="text" 
                    placeholder="Type your message here..." 
                    className="dark:border-gray-600 w-full  dark:bg-gray-800 px-5 py-2 rounded-full h-full focus:outline-none" 
                />

               <div className="flex gap-1">
                 <button className="dark:bg-blue-500 h-10 w-10 flex justify-center items-center px-3 py-2 rounded-full">
                    <MdAttachFile size={20}/>
                </button>

                 <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-10 flex justify-center items-center px-3 py-2 rounded-full">
                    <MdSend size={20}/>
                </button>
               </div>
            </div>
        </div>
   </div>
  )
}

export default ChatPage;
