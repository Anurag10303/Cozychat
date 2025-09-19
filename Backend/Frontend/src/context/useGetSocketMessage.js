import React from 'react'
import { useSocketContext } from './SocketContext'
import useConversation from '../zutstand/userConveration';
import { useEffect } from 'react';
import sound from '../assets/Order-up-bell-sound-effect.mp3';

const useGetSocketMessage=()=> {
  const{socket} =useSocketContext();
  const{messages,setMessage}=useConversation();
  useEffect(()=>{
    socket.on("newMessage",(newMessage)=>{
      const notification=new Audio(sound);
      notification.play();
      setMessage([...messages,newMessage]);
    });
    return()=>{
      socket.off("newMessage");
    };
  },[socket,messages,setMessage]);
  
}

export default useGetSocketMessage