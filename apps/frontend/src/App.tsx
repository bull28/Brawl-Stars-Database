import {lazy, Suspense, useEffect} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import SkullBackground from "./components/SkullBackground";

const Home = lazy(() => import("./pages/Home"));
const Brawlers = lazy(() => import("./pages/Brawlers"));
const Brawler = lazy(() => import("./pages/Brawler"));
const ModelViewer = lazy(() => import("./pages/ModelViewer"));
const SkinSearch = lazy(() => import("./pages/SkinSearch"));
const Events = lazy(() => import("./pages/Events"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Account = lazy(() => import("./pages/Account"));
const Collection = lazy(() => import("./pages/Collection"));
const Trade = lazy(() => import("./pages/Trade"));
const MyTrades = lazy(() => import("./pages/MyTrades"));
const Shop = lazy(() => import("./pages/Shop"));
const AudioPlayer = lazy(() => import("./components/AudioPlayer"));
const ChallengeMenu = lazy(() => import("./challengev1/ChallengeMenu"));
const Accessories = lazy(() => import("./pages/Accessories"));
const Leaderboard = lazy(() => import("./challengev1/Leaderboard"));
const GameMenu = lazy(() => import("./pages/GameMenu"));
const GameRewards = lazy(() => import("./pages/GameRewards"));
const GameEnemies = lazy(() => import("./pages/GameEnemies"));
const ChallengeStart = lazy(() => import("./pages/ChallengeStart"));
const ChallengeCreate = lazy(() => import("./pages/ChallengeCreate"));

function BackgroundPages(){
    return (
    <div className="app">
        <SkullBackground/>
        <Routes>
            <Route path="/brawlers" element={<Suspense fallback={<></>}><Brawlers/></Suspense>}/>
            <Route path="/brawlers/:brawler" element={<Suspense fallback={<></>}><Brawler/></Suspense>}/>
            <Route path="/brawlers/modelviewer" element={<Suspense fallback={<></>}><ModelViewer/></Suspense>}/>
            <Route path="/brawlers/skinsearch" element={<Suspense fallback={<></>}><SkinSearch/></Suspense>}/>
            <Route path="/events" element={<Suspense fallback={<></>}><Events/></Suspense>}/>
            <Route path="/collection" element={<Suspense fallback={<></>}><Collection/></Suspense>}/>
            <Route path="/trade" element={<Suspense fallback={<></>}><Trade/></Suspense>}/>
            <Route path="/mytrades" element={<Suspense fallback={<></>}><MyTrades/></Suspense>}/>
            <Route path="/bullgame" element={<Suspense fallback={<></>}><GameMenu/></Suspense>}/>
            <Route path="/bullgame/accessories" element={<Suspense fallback={<></>}><Accessories/></Suspense>}/>
            <Route path="/bullgame/rewards" element={<Suspense fallback={<></>}><GameRewards/></Suspense>}/>
            <Route path="/bullgame/enemies" element={<Suspense fallback={<></>}><GameEnemies/></Suspense>}/>
            <Route path="/bullgame/challenges" element={<Suspense fallback={<></>}><ChallengeStart/></Suspense>}/>
            <Route path="/bullgame/createchallenge" element={<Suspense fallback={<></>}><ChallengeCreate/></Suspense>}/>
            <Route path="/challengev1" element={<Suspense fallback={<></>}><ChallengeMenu/></Suspense>}/>
            <Route path="/challengev1/leaderboard" element={<Suspense fallback={<></>}><Leaderboard/></Suspense>}/>
            <Route path="*" element={<Suspense fallback={<></>}><NotFound/></Suspense>}/>
        </Routes>
        <AudioPlayer/>
    </div>
    );
}

function App(){
    useEffect(() => localStorage.setItem("chakra-ui-color-mode", "dark"), []);

    return (
    <div className="app">
        <BrowserRouter future={{v7_relativeSplatPath: false, v7_startTransition: false}}>
            <Routes>
                <Route path="/" element={<Suspense fallback={<></>}><Home/></Suspense>}/>
                <Route path="/account" element={<Suspense fallback={<></>}><Account/></Suspense>}/>
                <Route path="/gallery" element={<Suspense fallback={<></>}><Gallery/></Suspense>}/>
                <Route path="/login" element={<Suspense fallback={<></>}><Login/></Suspense>}/>
                <Route path="/signup" element={<Suspense fallback={<></>}><Signup/></Suspense>}/>
                <Route path="/shop" element={<Suspense fallback={<></>}><Shop/></Suspense>}/>
                <Route path="*" element={<Suspense fallback={<></>}><BackgroundPages/></Suspense>}/>
            </Routes>
        </BrowserRouter>
        <AudioPlayer/>
    </div>
    );
}

export default App;
