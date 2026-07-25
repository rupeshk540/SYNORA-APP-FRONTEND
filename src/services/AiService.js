import { httpClient } from "./AxiosHelper";

export const fixTextApi = async (text) => {
    const response = await httpClient.post(`/api/ai/fix`, { text });
    return response.data; // { correctedText }
};