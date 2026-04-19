import { io } from "socket.io-client";
export const createSocket = ({ studentId, admin } = {}) => {
  const socket = io(process.env.REACT_APP_SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: {
      studentId,
      admin,
    },
  });

  return socket;
};
