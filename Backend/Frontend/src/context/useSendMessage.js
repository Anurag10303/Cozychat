import { useState } from "react";
import useConversation from "../zutstand/userConveration";
import { useAuth } from "./AuthProvider";
import BASE_URL from "../config";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [authUser]= useAuth();
  const { messages, setMessage, selectedConversation } = useConversation();

  const sendMessages = async (message) => {
  if (selectedConversation && selectedConversation._id) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${BASE_URL}/user/message/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ message }),
        }
      );
      const data = await res.json();

      // Get sender ID (your own ID) from auth
       // Or useContext if available
      const myId = authUser.user._id;
      console.log("THHHHH",myId);
      console.log(authUser);
console.log("DATA",data);
      // Force correct structure
      const newMessage = {
        ...data,
        message: data.message,
        senderId: myId, // Manually set your ID
      };

      setMessage([...messages, newMessage]);
     console.log("..message",...messages,newMessage);
    } catch (error) {
      console.error("Error in sending message", error);
    } finally {
      setLoading(false);
    }
  }
};
  return { loading, sendMessages };
};

export default useSendMessage;
