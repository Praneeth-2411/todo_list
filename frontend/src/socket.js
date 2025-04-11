// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://todolist-ioly.onrender.com");

export default socket;
