import {lazy, Suspense} from "react";
import {BrowserRouter, Route, Routes} from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'));
const Brawlers = lazy(() => import('./pages/Brawlers'));
const Brawler = lazy(() => import('./pages/Brawler'));
const Events = lazy(() => import('./pages/Events'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Account = lazy(() => import('./pages/Account'));
const Collection = lazy(() => import('./pages/Collection'));
const Trade = lazy(() => import('./pages/Trade'));
const MyTrades = lazy(() => import('./pages/MyTrades'));
const Shop = lazy(() => import('./pages/Shop'));
const AudioPlayer = lazy(() => import('./components/AudioPlayer'));
const ChallengeMenu = lazy(() => import('./pages/ChallengeMenu'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Suspense fallback={<></>}><Home/></Suspense>}/>
          <Route path="/brawlers" element={<Suspense fallback={<></>}><Brawlers/></Suspense>}/>
          <Route path="brawlers/:brawler" element={<Suspense fallback={<></>}><Brawler/></Suspense>}/>
          <Route path="/events" element={<Suspense fallback={<></>}><Events/></Suspense>}/>
          <Route path="/gallery" element={<Suspense fallback={<></>}><Gallery/></Suspense>}/>
          <Route path="/login" element={<Suspense fallback={<></>}><Login/></Suspense>}/>
          <Route path="/signup" element={<Suspense fallback={<></>}><Signup/></Suspense>}/>
          <Route path="/account" element={<Suspense fallback={<></>}><Account/></Suspense>}/>
          <Route path="/collection" element={<Suspense fallback={<></>}><Collection/></Suspense>}/>
          <Route path="/trade" element={<Suspense fallback={<></>}><Trade/></Suspense>}/>
          <Route path="/mytrades" element={<Suspense fallback={<></>}><MyTrades/></Suspense>}/>
          <Route path="/shop" element={<Suspense fallback={<></>}><Shop/></Suspense>}/>
          <Route path="/challenges" element={<Suspense fallback={<></>}><ChallengeMenu/></Suspense>}/>
          <Route path="/leaderboard" element={<Suspense fallback={<></>}><Leaderboard/></Suspense>}/>
          <Route path="*" element={<Suspense fallback={<></>}><NotFound/></Suspense>}/>        
        </Routes>
      </BrowserRouter>
      <AudioPlayer/>
    </div>
  );
}

export default App;
