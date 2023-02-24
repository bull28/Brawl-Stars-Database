import axios from 'axios'
import { createStandaloneToast } from '@chakra-ui/react'

//functions that deal with token storage/retrieval and post requests using them

export function getToken(){
    return JSON.parse(localStorage.getItem('tokens') || "{}")[localStorage.getItem('username') || ""]
}

export function changeToken(username: string, token: string){
    let temp = JSON.parse(localStorage.getItem('tokens') || "{}")

    if (!(username in temp)){
        temp[username] = token
    }

    localStorage.setItem('tokens', JSON.stringify(temp));
    localStorage.setItem('username', username)
}

interface AuthRequestConfigProps {
    setState?: {
        func: any,
        attr: string
    }[],
    data?: any,
    callback?: any,
    fallback?: any,
    navigate?: boolean,
    message?: {
        title?: string,
        description?: string,
        status?: "success" | "error",
        duration?: number,
        data?: string
    },
    errorToastMessage?: string
}

export default async function AuthRequest(endpoint:string, config:AuthRequestConfigProps) {
    const { toast } = createStandaloneToast()

    axios.post(endpoint, {token: getToken(), ...config.data})
        .then((res) => {
            if (config.setState){
                config.setState.forEach(function(item){
                    if (item.attr === ""){
                        item.func(res.data)
                    } else {
                        item.func(res.data[item.attr])
                    }
                    
                })
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