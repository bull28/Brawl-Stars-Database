import {keyframes} from "@emotion/react";

export function GoldText(){
    return keyframes`
        0% {color: #fdf542;}
        25% {color: #fdd000;}
        50% {color: #ff9005;}
        75% {color: #fdd000;}
        100% {color: #fdf542;}
    `
}

export function RainbowBorder(){
    return keyframes`    
        0% {border: 3px solid #f00;}
        17% {border: 3px solid #ff0;}
        33% {border: 3px solid #0f0;}
        50% {border: 3px solid #0ff;}
        67% {border: 3px solid #00f;}
        83% {border: 3px solid #f0f;}
        100% {border: 3px solid #f00;}
    `
}

export function RainbowBackground(){
    return keyframes`
        0% {background-color: #f00;}
        17% {background-color: #ff0;}
        33% {background-color: #0f0;}
        50% {background-color: #0ff;}
        67% {background-color: #00f;}
        83% {background-color: #f0f;}
        100% {background-color: #f00;}                
    `
}

export function MovingBackground(){
    return keyframes`
    0% {
        background-position: 0px;
    }
    100% {
        background-position: 1000px;
    }
    
    `
}