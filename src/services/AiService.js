import { httpClient } from "./AxiosHelper";

export const fixTextApi = async (text) => {
    const response = await httpClient.post(`/api/ai/fix`, { text });
    return response.data; // { correctedText }
};

export const summarizeRoomApi = async (roomId, since) => {
    const response = await httpClient.get(`/api/ai/summarize/${roomId}`, { params: { since } });
    return response.data; // { summary, messageCount }
};