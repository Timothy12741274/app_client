import axios from "axios";
import cookie from "js-cookie";

export const baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL
export const AVATAR = process.env.NEXT_PUBLIC_DEFAULT_AVATAR_URL
export const inst = axios.create({ baseURL, withCredentials: true })
export const userId = cookie.get('userId')