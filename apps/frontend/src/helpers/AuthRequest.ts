import axios, {AxiosError, AxiosResponse} from 'axios'
import { createStandaloneToast } from '@chakra-ui/react'
import api from './APIRoute';

//functions that deal with token storage/retrieval and post requests using them

export function getToken(): string | undefined{
    try{
        return JSON.parse(localStorage.getItem('tokens') || "{}")[localStorage.getItem('username') || ""];
    } catch (error){
        return undefined;
    }
}

export function changeToken(username: string, token: string){
    let temp = JSON.parse(localStorage.getItem('tokens') || "{}")

    if (!(username in temp)){
        temp[username] = token
    }

    localStorage.setItem('tokens', JSON.stringify(temp));
    localStorage.setItem('username', username)
}

interface AuthRequestConfigProps<T>{
    setState?: (data: T) => void;
    data?: Record<string, any>;
    callback?: () => void;
    fallback?: (error: Error) => void;
    navigate?: boolean;
    message?: {
        title?: string;
        description?: string;
        status?: "success" | "error";
        duration?: number;
        data?: string;
    };
    errorToastMessage?: string;
    server?: string;
}

export default async function AuthRequest<T>(endpoint: string, config: AuthRequestConfigProps<T>, post: boolean = true) {
    const { toast } = createStandaloneToast();
    let token = getToken();
    if (config.data && typeof config.data.token === "string"){
        token = config.data.token;
    }

    const callback1 = (res: AxiosResponse<T>) => {
        if (config.setState){
            config.setState(res.data);
        }

        if (config.message){
            if (config.message.data && config.message.description){
                let desc = config.message.description;
                const data = res.data as Record<string, string>;
                if (typeof res.data === "object" && data[config.message.data] !== undefined){
                    desc = desc.replace("$", data[config.message.data])
                } else{
                    desc = desc.replace("$", "");
                }
                //toast({...config.message, duration: 3000, isClosable: true, description: config.message.description?.replace('$', res.data[config.message.data])})
                toast({...config.message, duration: 3000, isClosable: true, description: desc});
            } else {
                toast({...config.message, duration: 3000, isClosable: true});
            }
        }
    };
    const callback2 = config.callback ? config.callback : () => {};
    const callbackError = config.fallback ? config.fallback : (error: AxiosError) => {
        if (error.response === undefined){
            return;
        }

        if (error.response.status === 400 || error.response.status === 401){
            localStorage.removeItem('username')

            if (config.navigate){
                document.location.replace('/login')
            }
        }

        if (config.errorToastMessage){
            toast({title: config.errorToastMessage, description: error.response.data ? error.response.data as string : "An error occurred.", status: 'error', duration: 3000, isClosable: true})
        }
    }

    if (post){
        axios.post(
            `${config.server ? config.server : api}${endpoint}`,
            {token: getToken(), ...config.data},
            {headers: {"Authorization": `Bearer ${token}`}}
        ).then(callback1).then(callback2).catch(callbackError);
    } else{
        axios.get(
            `${config.server ? config.server : api}${endpoint}`,
            {headers: {"Authorization": `Bearer ${token}`}}
        ).then(callback1).then(callback2).catch(callbackError);
    }
}
