import {SeasonTime} from "../types/EventData";

export default function EventTime(lastUpdate: SeasonTime, offset: number){
    var displaySeconds = (lastUpdate.second - Math.floor(offset / 1000));
    var displayMinutes = (lastUpdate.minute - Math.floor(offset / 60000) + Math.floor(displaySeconds / 60));
    var displayHours = (lastUpdate.hour - Math.floor(offset / 3600000) + Math.floor(displayMinutes / 60));

    displaySeconds = (((displaySeconds % 60) + 60) % 60);
    displayMinutes = (((displayMinutes % 60) + 60) % 60);

    if (displayHours < 0){
        return "Now";
    }

    var timeString = "";

    if (displayHours > 0){
        timeString += (`${displayHours}h `);
    } else{
        if (displayMinutes === 0 && displaySeconds === 0){
            timeString += "0s ";
        }
    }
    
    if (displayMinutes > 0){
        timeString += (`${displayMinutes}m `);
    } if (displaySeconds > 0){
        timeString += (`${displaySeconds}s `);
    }

    timeString = timeString.trimEnd();

    return timeString;
}
