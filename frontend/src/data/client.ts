import { Axios, AxiosResponse } from "axios";
import Cookies from "js-cookie";

export const backendClient = new Axios({
  baseURL: process.env.NEXT_PUBLIC_ONTOLOGY_BACKEND,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: (status: number) => {
    return status >= 200 && status < 300;
  },
});

const getSessionToken = () => {
  const sessionToken = Cookies.get("__session");

  return sessionToken;
};

// Fetches can be moved to their own file as they are generic
export const backendGet = <T = any>(
  url: string,
  query?: object,
): Promise<T> => {
  return backendClient
    .get(url, {
      params: query,
      headers: { Authorization: `Bearer ${getSessionToken()}` },
    })
    .then((res: AxiosResponse) => {
      if (typeof res.data === "string") {
        return JSON.parse(res.data);
      }
      return res.data as T;
    });
};

export const backendUpdate = (url: string, data: any) => {
  console.log("backendUpdate", url, data);
  return backendClient
    .patch(url, JSON.stringify(data), {
      headers: { Authorization: `Bearer ${getSessionToken()}` },
    })
    .then((res: AxiosResponse) => JSON.parse(res.data));
};

export const backendCreate = (url: string, data: any) => {
  console.log("backendCreate", url, data);
  return backendClient
    .post(url, JSON.stringify(data), {
      headers: { Authorization: `Bearer ${getSessionToken()}` },
    })
    .then((res: AxiosResponse) => JSON.parse(res.data));
};

export const backendDelete = (url: string) => {
  console.log("backendDelete", url);
  return backendClient
    .delete(url, {
      headers: { Authorization: `Bearer ${getSessionToken()}` },
    })
    .then((res: AxiosResponse) => res.data);
};

export const requestPost = (url: string, data?: any) => {
  return backendClient
    .post(url, JSON.stringify(data), {
      headers: { Authorization: `Bearer ${getSessionToken()}` },
    })
    .then((res: AxiosResponse) => JSON.parse(res.data));
};
