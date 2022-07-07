import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Brawlers from './pages/Brawlers'
import Brawler from './pages/Brawler'
import Maps from './pages/Maps'
import Modes from './pages/Modes'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/brawlers" element={<Brawlers/>}/>
          <Route path="brawlers/:brawler" element={<Brawler/>}/>
          <Route path="/maps" element={<Maps/>}/>
          <Route path="/modes" element={<Modes/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
