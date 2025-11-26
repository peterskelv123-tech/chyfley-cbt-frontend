import { io } from "socket.io-client";
export const createSocket = () => {
  return io(process.env.REACT_APP_SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
  });
};


