import axios from "axios";

export const api=axios.create({
baseURL:"https://academic-portal-16620c77.fastapicloud.dev",
withCredentials:true
});