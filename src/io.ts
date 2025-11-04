import type { Server } from "socket.io";

let ioRef: Server | undefined;

export const setIO = (io: Server) => { ioRef = io; };
export const getIO = () => {
  if (!ioRef) throw new Error("Socket.IO ainda não foi inicializado");
  return ioRef;
};
