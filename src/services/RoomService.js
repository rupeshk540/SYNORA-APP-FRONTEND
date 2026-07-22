import { httpClient } from "../services/AxiosHelper"

export const createRoomApi = async ({ roomId, name }) => {
    const response = await httpClient.post(`/api/v1/rooms`, { roomId, name });
    return response.data;
};
    

export const joinChatApi = async (roomId) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}`);
    return response.data;
}

export const getMessages = async (roomId,size=50,page=0) => {
    const response = await httpClient.get(`/api/v1/rooms/${roomId}/messages?size=${size}&page=${page}`);
    return response.data;
}

export const getMyRoomsApi = async () => {
    const response = await httpClient.get(`/api/v1/rooms/my-rooms`);
    return response.data;
};

export const markAsReadApi = async (roomId) => {
    const response = await httpClient.post(`/api/v1/rooms/${roomId}/read`);
    return response.data;
};