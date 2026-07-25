import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({children}) => {

    const [roomId, setRoomId] = useState('')
    const [currentUser, setCurrentUser] = useState('')
    const [connected, setConnected] = useState(false)
    const [catchUpSnapshot, setCatchUpSnapshot] = useState(null);

    return (
        <ChatContext.Provider value={{roomId,currentUser,connected,catchUpSnapshot,setRoomId,setCurrentUser,setConnected, setCatchUpSnapshot}}>  
            {children}
        </ChatContext.Provider>
    )
};

const useChatContext = () => useContext(ChatContext);
export default useChatContext;