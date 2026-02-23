import { io } from "socket.io-client";
export const createSocket = () => {
  const socket = io(process.env.REACT_APP_SOCKET_URL, {
    transports: ["polling", "websocket"], // allow fallback for localhost
    autoConnect: true,
  });

  socket.on("connect", () => console.log("Socket connected ✅", socket.id));
  socket.on("connect_error", (err) => console.error("Socket connect error:", err));
  socket.on("disconnect", (reason) => console.log("Socket disconnected:", reason));

  return socket;
};


