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

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Suspense fallback={<></>}>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/brawlers" element={<Brawlers/>}/>
            <Route path="brawlers/:brawler" element={<Brawler/>}/>
            <Route path="/events" element={<Events/>}/>
            <Route path="/gallery" element={<Gallery/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
            <Route path="/account" element={<Account/>}/>
            <Route path="/collection" element={<Collection/>}/>
            <Route path="/trade" element={<Trade/>}/>
            <Route path="/mytrades" element={<MyTrades/>}/>
            <Route path="/shop" element={<Shop/>}/>
            <Route path="/challenges" element={<ChallengeMenu/>}/>
            <Route path="*" element={<NotFound/>}/>        
          </Routes>
        </Suspense>
      </BrowserRouter>
      <AudioPlayer/>
    </div>
  );
}

export default App;
