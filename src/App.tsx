import { Routes, Route } from 'react-router-dom';

import Compoents from './pages/test/Compoents';
import Home from './pages/Home';
import { useEffect, useState } from 'react';
import FullScreenLoading from './components/ui/FullScreenLoading';
import ControllerUpdatePage from './pages/ControllerUpdatePage';
import { ControllerProvider } from './contexts/ControllerContext';
import SigninPage from './pages/SigninPage';
import SignupAgreePage from './pages/SignupAgreePage';
import SignupPage from './pages/SignupPage';
import SignupCompletePage from './pages/SignupCompletePage';


function App() {

  // const [loading, setLoading] = useState(true);

  // useEffect(() => {

  //   setTimeout(() => setLoading(false), 1500);

  // }, [])

  // if (loading) {
  //   return (
  //     <>
  //       <FullScreenLoading color="#0F7685" />
  //     </>
  //   )
  // }

  return (
    <ControllerProvider>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/controller-update/:id" element={<ControllerUpdatePage />}></Route>
        <Route path="/components-test" element={<Compoents />}></Route>
        <Route path="/signin" element={<SigninPage />}></Route>
        <Route path="/signup-agree" element={<SignupAgreePage />}></Route>
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="/signup-complete" element={<SignupCompletePage />}></Route>
      </Routes>
    </ControllerProvider>
  )
}

export default App
