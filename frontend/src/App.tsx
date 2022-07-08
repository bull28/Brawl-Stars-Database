import './App.css';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Home from './pages/Home'
import Brawlers from './pages/Brawlers'
import Brawler from './pages/Brawler'
import Events from './pages/Events'
import NotFound from './pages/NotFound'

function App() {
  return (
    <div className='app'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/brawlers" element={<Brawlers/>}/>
          <Route path="brawlers/:brawler" element={<Brawler/>}/>
          <Route path="/events" element={<Events/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
