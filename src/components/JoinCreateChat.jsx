// import { useState } from "react";
// import chatIcon from "../assets/chat.png";
// import toast from "react-hot-toast";
// import { createRoomApi, joinChatApi } from "../services/RoomService";
// import useChatContext from "../context/ChatContext";
// import { useNavigate } from "react-router";


// const JoinCreateChat=() =>{

//     const [detail, setDetail] = useState({
//         roomId:'',
//         userName:''
//     })

//     const {roomId,userName,connected,setRoomId,setCurrentUser,setConnected}=useChatContext();
//     const navigate=useNavigate();

//     function handleFormInputChange(event) {
//         setDetail({
//             ...detail,
//             [event.target.name]:event.target.value,
//         });
//     }

//     function validateForm(){
//         if(detail.roomId==="" || detail.userName===""){
//             toast.error("Invalid Input !!")
//             return false;
//         }
//         return true;
//     }

//     //join room
//    async function joinChat(){
//         if(validateForm()){
           
//             try {
//                 const room = await joinChatApi(detail.roomId);
//                 toast.success("Joined..!")
//                 setCurrentUser(detail.userName);
//                 setRoomId(room.roomId);
//                 setConnected(true);
//                 navigate("/chat");
//             } catch (error) {
//                if(error.status==400){
//                 toast.error(error.response.data);
//                }else{
//                  toast.error("Error in joining room");
//                }
//             }
//         }
//     }

//     //create room
//    async function createRoom(){
//         if(validateForm()){
//             //call api to create room on server
//             try{
//               const response = await createRoomApi(detail.roomId)
//               console.log(response)
//               toast.success("Room created Successfully !!");
              
//               //join the room
//               setCurrentUser(detail.userName);
//               setRoomId(response.roomId);
//               setConnected(true);
//               //forward to chat page
//               navigate("/chat")
//             }catch(error){
//                 console.log(error);
//                 if(error.status==400){
//                     toast.error("Room already exists !!");
//                 }else{
//                     toast.error("Error in creating room !!")
//                 }
//             }
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center">
//             <div className=" p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow">
            
//             {/* image field */}
//             <div>
//                 <img src={chatIcon} className="w-24 mx-auto" />
//             </div>
            
//                 <h1 className="text-2xl font-semibold text-center">Join Room / Create Room..</h1>
            
//             {/* name field */}
//                 <div>
//                     <label htmlFor="name" className="block font-medium mb-2">Your name</label>
//                     <input 
//                         onChange={handleFormInputChange}
//                         value={detail.userName}
//                         type="text"  
//                         id="name"
//                         name="userName"
//                         placeholder="Enter the name"
//                         className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 {/* roomId field */}
//                 <div>
//                     <label htmlFor="name" className="block font-medium mb-2">Room ID</label>
//                     <input 
//                         name="roomId"
//                         onChange={handleFormInputChange}
//                         value={detail.roomId}
//                         type="text"  
//                         id="name"
//                         placeholder="Enter the room id"
//                         className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 {/* button */}
//                 <div className="flex justify-center gap-2 mt-4">
//                     <button onClick={joinChat} className="px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded">
//                         Join Room
//                     </button>

//                     <button onClick={createRoom} className="px-3 py-2 dark:bg-orange-500 hover:dark:bg-orange-800 rounded">
//                         Create Room
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
// }

// export default JoinCreateChat;
import { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import "../customcss/JoinCreateChat.css"

const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: "",
    userName: "",
  });

  const { roomId, userName, connected, setRoomId, setCurrentUser, setConnected } =
    useChatContext();
  const navigate = useNavigate();

  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  function validateForm() {
    if (detail.roomId === "" || detail.userName === "") {
      toast.error("Invalid Input !!");
      return false;
    }
    return true;
  }

  // join room
  async function joinChat() {
    if (validateForm()) {
      try {
        const room = await joinChatApi(detail.roomId);
        toast.success("Joined..!");
        setCurrentUser(detail.userName);
        setRoomId(room.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Error in joining room");
        }
      }
    }
  }

  // create room
  async function createRoom() {
    if (validateForm()) {
      // call api to create room on server
      try {
        const response = await createRoomApi(detail.roomId);
        console.log(response);
        toast.success("Room created Successfully !!");

        // join the room
        setCurrentUser(detail.userName);
        setRoomId(response.roomId);
        setConnected(true);
        // forward to chat page
        navigate("/chat");
      } catch (error) {
        console.log(error);
        if (error.status == 400) {
          toast.error("Room already exists !!");
        } else {
          toast.error("Error in creating room !!");
        }
      }
    }
  }

  return (
    <div className="jcc-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      {/* ambient background glow — plain CSS, not expressible with default Tailwind config */}
      <div className="jcc-glow" aria-hidden="true"></div>

      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/60 dark:shadow-black/40 p-8 sm:p-10">
        {/* Icon */}
        <div className="flex justify-center mb-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 dark:bg-gray-800 ring-1 ring-blue-100 dark:ring-gray-700">
            <img src={chatIcon} className="w-9 h-9" alt="Chat icon" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Join or Create a Room
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Enter your details to start chatting instantly.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* name field */}
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Your name
            </label>
            <input
              onChange={handleFormInputChange}
              value={detail.userName}
              type="text"
              id="userName"
              name="userName"
              placeholder="Enter your name"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* roomId field */}
          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Room ID
            </label>
            <input
              name="roomId"
              onChange={handleFormInputChange}
              value={detail.roomId}
              type="text"
              id="roomId"
              placeholder="Enter the room ID"
              autoComplete="off"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={joinChat}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm shadow-blue-600/20"
            >
              Join Room
            </button>

            <button
              onClick={createRoom}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 hover:bg-blue-100 dark:hover:bg-gray-700 active:bg-blue-200 transition-colors"
            >
              Create Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;