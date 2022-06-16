import { axiosInstance } from ".";

export const fetchMainVideos = async () => {
    return await axiosInstance.get(`/api/main-videos?populate=video`);
};

export const fetchUserVideos = async () => {
    return await axiosInstance.get(`/api/users/me?populate=video`);
};

export const sendRecording = async (data) => {
    return await axiosInstance.post(`/api/upload`, data);
};
