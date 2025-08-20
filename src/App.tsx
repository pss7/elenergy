import { Routes, Route } from 'react-router-dom';

import Compoents from './pages/test/Compoents';
import Home from './pages/Home';


function App() {

  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="components-test" element={<Compoents />}></Route>
    </Routes>
  )
}

export default App
