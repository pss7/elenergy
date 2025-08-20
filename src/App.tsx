import { Routes, Route } from 'react-router-dom';

import Compoents from './pages/test/Compoents';
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import FullScreenLoading from './components/ui/FullScreenLoading';
import ControllerUpdatePage from './pages/ControllerUpdatePage';


function App() {

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    setTimeout(() => setLoading(false), 1500);

  }, [])

  if (loading) {
    return (
      <>
        <FullScreenLoading color="#0F7685" />
      </>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/controller-update" element={<ControllerUpdatePage />}></Route>
      <Route path="/components-test" element={<Compoents />}></Route>
    </Routes>
  )
}

export default App
