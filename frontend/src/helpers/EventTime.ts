import {time} from "../types/EventData";

export default function EventTime(lastUpdate: time, offset: number){
    var displaySeconds: number = (lastUpdate.second - Math.floor(offset / 1000));
    var displayMinutes: number = (lastUpdate.minute - Math.floor(offset / 60000) + Math.floor(displaySeconds / 60));
    var displayHours: number = (lastUpdate.hour - Math.floor(offset / 3600000) + Math.floor(displayMinutes / 60));

    displaySeconds = (((displaySeconds % 60) + 60) % 60);
    displayMinutes = (((displayMinutes % 60) + 60) % 60);

    if (displayHours < 0){
        return "Now";
    }

    var timeString: string = "";

    if (displayHours > 0){
        timeString += (displayHours.toString() + "h ");
    } else{
        if (displayMinutes === 0 && displaySeconds === 0){
            timeString += "0s ";
        }
    }
    
    if (displayMinutes > 0){
        timeString += (displayMinutes.toString() + "m ");
    } if (displaySeconds > 0){
        timeString += (displaySeconds.toString() + "s ");
    }

    timeString = timeString.slice(0, timeString.length - 1);

    return timeString;
}
