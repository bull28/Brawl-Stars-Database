import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Brawlers from './pages/Brawlers'
import Brawler from './pages/Brawler'
import Events from './pages/Events'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Gallery from './pages/Gallery'
import Account from './pages/Account'
import Collection from './pages/Collection'
import Trade from './pages/Trade'
import MyTrades from './pages/MyTrades'
import Shop from './pages/Shop'
import AudioPlayer from './components/AudioPlayer'
import ChallengeMenu from './pages/ChallengeMenu'

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
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
      </BrowserRouter>
      <AudioPlayer/>
    </div>
  );
}

export default App;
