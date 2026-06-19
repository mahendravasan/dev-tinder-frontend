import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Smile, Paperclip, MessageSquareOff, Heart, Compass } from "lucide-react";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { toUserId } = useParams();
  const user = useSelector((state) => state.user);
  const userId = user?._id;
  const navigate = useNavigate();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isFriend, setIsFriend] = useState(true);
  const socketRef = useRef(null);

  const fetchChat = async () => {
    try {
      const chat = await axios.get(`${BASE_URL}/chat/${toUserId}`, {
        withCredentials: true,
      });
      const messages = chat.data.messages.map((message) => ({
        ...message,
        fromMe: message?.sender?._id === userId,
        firstName: message?.sender?.firstName,
        lastName: message?.sender?.lastName,
        text: message?.content,
      }));
      console.log("🚀 ~ fetchChat ~ messages:", messages);
      setMessages(messages);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchChat();
  }, [userId, toUserId]);

  useEffect(() => {
    if (!userId || !toUserId) return;
    // Create the connection once and keep it for both listening and sending.
    const socket = createSocketConnection();
    socketRef.current = socket;
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted.
    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      toUserId,
      text: newMessage,
    });

    // listen for the server's answer
    socket.on("chatStatus", (data) => {
      setIsFriend(data.isFriend);
    });

    socket.on("receiveMessage", ({ firstName, text, userId: senderId }) => {
      console.log(firstName + " ", text);
      setMessages((prevMessages) => [
        ...prevMessages,
        { firstName, text, fromMe: senderId === userId },
      ]);
    });

    // As soon as the page/component is unmounted, the socket connection should disconnected.
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, toUserId]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket) return;
    const text = newMessage.trim();
    if (!text) return;
    socket.emit("sendMessage", {
      firstName: user.firstName,
      userId,
      toUserId,
      text,
    });
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8 overflow-hidden">
      {/* Self-contained CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-2xl h-[75vh] flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/60">
          <button
            className="btn btn-square btn-ghost btn-sm text-slate-400 hover:text-white rounded-xl"
            onClick={() => navigate("/connections")}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="avatar">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700">
              <img
                src="https://geographyandyou.com/images/user-profile.png"
                alt="User avatar"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-sm text-white leading-tight">
              Developer Chat
            </h2>
            <span className={`text-xs font-medium ${isFriend ? "text-emerald-400" : "text-slate-500"}`}>
              {isFriend ? "Online" : "Offline"}
            </span>
          </div>
        </div>

        {isFriend ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg?.fromMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg?.fromMe
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md"
                        : "bg-slate-800 text-slate-200 rounded-bl-md"
                    }`}
                  >
                    {msg?.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-slate-800 bg-slate-900/60">
              <button className="btn btn-square btn-ghost btn-sm text-slate-400 hover:text-white rounded-xl">
                <Smile className="w-5 h-5" />
              </button>
              <button className="btn btn-square btn-ghost btn-sm text-slate-400 hover:text-white rounded-xl">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input input-md flex-1 bg-slate-950/60 border border-slate-800 focus:border-purple-500 text-slate-100 rounded-2xl focus:outline-none transition-all duration-200"
              />
              <button
                className="btn btn-sm btn-square rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white"
                onClick={sendMessage}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-900/20">
            <div className="relative mb-6">
              {/* Halo pulse glow */}
              <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-20 h-20 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center z-10 relative shadow-2xl">
                <MessageSquareOff className="w-8 h-8 text-rose-500" />
              </div>
            </div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Not Connected Yet
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-sm">
              You are not connected with this person. Send a connection request first to start chatting!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
              <button
                onClick={() => navigate("/")}
                className="btn btn-sm sm:btn-md flex-grow rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-none text-white text-xs font-bold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25"
              >
                <Compass className="w-4 h-4" />
                Explore Feed
              </button>
              <button
                onClick={() => navigate("/connections")}
                className="btn btn-sm sm:btn-md flex-grow rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                Connections
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
