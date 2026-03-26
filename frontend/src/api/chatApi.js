import axiosClient from "./axiosClient";

export const chatApi = {
  openRoom() {
    return axiosClient.post("/api/chat/rooms/open");
  },
  getMyRooms(params) {
    return axiosClient.get("/api/chat/rooms/me", { params });
  },
  getMessages(roomId, params) {
    return axiosClient.get(`/api/chat/rooms/${roomId}/messages`, { params });
  },
  sendMessage(payload) {
    return axiosClient.post("/api/chat/messages", payload);
  },
  markRead(roomId) {
    return axiosClient.post(`/api/chat/rooms/${roomId}/read`);
  },
};
