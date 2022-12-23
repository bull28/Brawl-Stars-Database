import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Brawlers from './pages/Brawlers'
import Brawler from './pages/Brawler'
import Events from './pages/Events'
import Map from './pages/MapView'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Gallery from './pages/Gallery'
import Account from './pages/Account'
import Collection from './pages/Collection'
import Trade from './pages/Trade'

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/brawlers" element={<Brawlers/>}/>
          <Route path="brawlers/:brawler" element={<Brawler/>}/>
          <Route path="events/:map" element={<Map/>}/>
          <Route path="/events" element={<Events/>}/>
          <Route path="/gallery" element={<Gallery/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signup" element={<Signup/>}/>
          <Route path="/account" element={<Account/>}/>
          <Route path="/collection" element={<Collection/>}/>
          <Route path="/trade" element={<Trade/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
