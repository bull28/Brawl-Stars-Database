import axios from 'axios'

export default async function postReq(endpoint: string, setState: any, data: any = {}, fallback: any) {
    axios.post(endpoint, {token: localStorage.getItem('token'), ...data})
        .then((res) => {
            setState(res.data)
        }).catch(fallback)
}