// src/socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:5123");

export default socket;
