import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import useConversation from "../zustand/userConveration";
import { useAuth } from "./AuthProvider";
import { useE2EE } from "./E2EEContext";
import BASE_URL from "../config";

const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [authUser] = useAuth();
  const { messages, setMessages, selectedConversation } = useConversation();
  const { encryptText } = useE2EE();

  const sendMessages = async (message = "", file = null) => {
    if (!selectedConversation?._id) return;
    if (!message.trim() && !file) return;

    setLoading(true);
    setProgress(0);

    try {
      const token = localStorage.getItem("token");
      const clientMessageId = uuidv4();
      const url = `${BASE_URL}/user/messages/send/${selectedConversation._id}`;

      // ── Encrypt the text portion before sending ──────────────
      let textToSend = message.trim();
      if (textToSend) {
        textToSend = await encryptText(selectedConversation._id, textToSend);
      }

      let data;

      if (file) {
        const formData = new FormData();
        formData.append("clientMessageId", clientMessageId);
        if (textToSend) formData.append("message", textToSend); // encrypted caption
        formData.append("file", file);

        data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100));
            }
          });
          xhr.addEventListener("load", () => {
            try {
              const json = JSON.parse(xhr.responseText);
              if (xhr.status >= 400)
                reject(new Error(json.message || "Failed"));
              else resolve(json);
            } catch {
              reject(new Error("Invalid response"));
            }
          });
          xhr.addEventListener("error", () =>
            reject(new Error("Network error")),
          );
          xhr.open("POST", url);
          xhr.withCredentials = true;
          if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          xhr.send(formData);
        });
      } else {
        const formData = new FormData();
        formData.append("clientMessageId", clientMessageId);
        formData.append("message", textToSend); // encrypted text

        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed");
      }

      const savedMessage = {
        ...data.data,
        // Store decrypted text locally so sender sees readable message immediately
        _decryptedMessage: message.trim(),
        senderId: data.data.senderId ?? authUser?.user?._id,
      };
      setMessages([...messages, savedMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Could not send message");
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return { loading, progress, sendMessages };
};

export default useSendMessage;
