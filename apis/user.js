import { axiosInstance } from "./index";


export const fetchUserDataVideos = async () => {
    return await axiosInstance.get(`/api/users/me?populate=video`);
};
