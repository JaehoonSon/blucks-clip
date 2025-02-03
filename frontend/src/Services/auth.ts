import api from "./axios";

export const refreshToken = async () => {
  return api.post("/api/refresh");
};

export const logout = async () => {
  return api.post("/api/logout");
};
