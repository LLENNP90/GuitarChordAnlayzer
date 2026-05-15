import { getAuthToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type SavedType = "chord" | "scale" | "progression";

async function apiFetch(path: string, options: RequestInit = {}) {
    const token = getAuthToken()

    const res = await fetch(`${API_URL}/${path}`, {
        ...options,
        headers:{
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        }
    })

    const data = await res.json()
    if (!res.ok || data.success === false){
        throw new Error(data.code ?? "API_ERROR");
    }

    return data
}

export const api = {
    signup(input:{
        username: string,
        email: string,
        password: string,
        name: string
    }) {
        return apiFetch("api/auth/signup", {
            method: "POST",
            body: JSON.stringify(input)
        });
    },

    login(input: {
        username: string,
        password: string,
    }) {
        return apiFetch("api/auth/login", {
            method:"POST",
            body: JSON.stringify(input)
        });
    },

    getMe(){
        return apiFetch("api/auth/me");
    },

    getSaved(type: SavedType){
        return apiFetch(`api/saved/${type}`);
    },

    createSaved(type: SavedType, input:{
        name: string,
        key?: string,
        mode?: string,
        notes?: string[],
        chord?: string[]
        voicingIndex?: number
    }) {
        return apiFetch(`api/saved/${type}`, {
            method: "POST",
            body: JSON.stringify(input)
        })
    },
    deleteSaved(type: SavedType, id: string) {
        return apiFetch(`api/saved/${type}/${id}`, {
            method: "DELETE",
        });
    },
    updateSavedName(type: SavedType, id: string, name: string) {
        return apiFetch(`api/saved/${type}/${id}`,{
            method:"PATCH",
            body: JSON.stringify({ name })
        })
    }
}



 