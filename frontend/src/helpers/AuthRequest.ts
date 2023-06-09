import axios from 'axios'
import { createStandaloneToast } from '@chakra-ui/react'

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
    data?: {};
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
}

export default async function AuthRequest<T>(endpoint:string, config: AuthRequestConfigProps<T>) {
    const { toast } = createStandaloneToast()

    axios.post(endpoint, {token: getToken(), ...config.data})
        .then((res) => {
            if (config.setState){
                config.setState(res.data);
            }

            if (config.message){
                if (config.message.data){
                    toast({...config.message, duration: 3000, isClosable: true, description: config.message.description?.replace('$', res.data[config.message.data])})
                } else {
                    toast({...config.message, duration: 3000, isClosable: true})
                }
            }
            
        }).then(config.callback ? config.callback :  () => {

        }).catch(config.fallback ? config.fallback : function(error) {
            if (error.response.status === 400 || error.response.status === 401){
                localStorage.removeItem('username')

                if (config.navigate){
                    document.location.replace('/login')
                }
            }

            if (config.errorToastMessage){
                toast({title: config.errorToastMessage, description: error.response.data, status: 'error', duration: 3000, isClosable: true})
            }
        })
}
