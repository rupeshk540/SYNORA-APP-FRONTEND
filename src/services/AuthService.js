import { httpClient } from "./AxiosHelper";


export const signup = async ({ email, password, displayName }) => {
    const response = await httpClient.post("/auth/signup", { email, password, displayName });
    return response.data; // { token, email, displayName }
};

export const login = async ({ email, password }) => {
    const response = await httpClient.post("/auth/login", { email, password });
    return response.data;
};