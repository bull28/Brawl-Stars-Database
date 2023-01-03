export function HMStoS({hours, minutes, seconds}:  {hours: number, minutes: number, seconds: number}){
    return (seconds + minutes*60 + hours*3600)
}

export function StoHMS(seconds: number){
    return (
        {
            hours: Math.floor(seconds/3600),
            minutes: Math.floor(seconds%3600 / 60),
            seconds: seconds%3600 % 60
        }
    )
}

