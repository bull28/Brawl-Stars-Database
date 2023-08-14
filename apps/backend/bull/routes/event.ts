import express from "express";
import {events, SeasonTime, realToTime, getAllEvents, addSeasonTimes, isValidTimeQuery} from "../modules/maps";

const router = express.Router();


interface TimeQuery{
    hour: string;
    minute: string;
    second: string;
}


// Get currently active events
router.get("/current", (req, res) => {
    const currentTime = realToTime(Date.now());
    const activeEvents = getAllEvents(events, currentTime);
    res.json(activeEvents);
});

// Get events active using a season time
router.get<{}, {}, {}, TimeQuery>("/seasontime", (req, res) => {
    const hourString = req.query.hour;
    const minuteString = req.query.minute;
    const secondString = req.query.second;

    if (isValidTimeQuery(hourString, minuteString, secondString) === false){
        res.status(400).send("Invalid input.");
        return;
    }

    const time = addSeasonTimes(
        new SeasonTime(0, 0, 0, 0), 
        new SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
    );

    const activeEvents = getAllEvents(events, time);

    res.json(activeEvents);
});

// Get events active a time interval later in the season
router.get<{}, {}, {}, TimeQuery>("/later", (req, res) => {
    const hourString = req.query.hour;
    const minuteString = req.query.minute;
    const secondString = req.query.second;

    const currentTime = realToTime(Date.now());

    if (isValidTimeQuery(hourString, minuteString, secondString) === false){
        res.status(400).send("Invalid input.");
        return;
    }

    const deltaTime = addSeasonTimes(
        currentTime,
        new SeasonTime(0, parseInt(hourString), parseInt(minuteString), parseInt(secondString))
    );

    const activeEvents = getAllEvents(events, deltaTime);

    res.json(activeEvents);
});

// Get currently active events
router.get<{}, {}, {}, TimeQuery>("/worldtime", (req, res) => {
    const realSeconds = req.query.second;

    if (isNaN(+realSeconds) === true){
        res.status(400).send("Invalid input.");
        return;
    }

    const time = realToTime(parseInt(realSeconds) * 1000);

    const activeEvents = getAllEvents(events, time);

    res.json(activeEvents);
});

export default router;
