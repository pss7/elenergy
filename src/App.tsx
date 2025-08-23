import { Routes, Route } from 'react-router-dom';
import { ControllerProvider } from './contexts/ControllerContext';
// import { useEffect, useState } from 'react';
// import FullScreenLoading from './components/ui/FullScreenLoading';
import Compoents from './pages/test/Compoents';

import Home from './pages/Home';
import ControllerUpdatePage from './pages/ControllerUpdatePage';

import SigninPage from './pages/auth/SigninPage';
import SignupAgreePage from './pages/auth/SignupAgreePage';
import SignupPage from './pages/auth/SignupPage';
import SignupCompletePage from './pages/auth/SignupCompletePage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import IdFindPage from './pages/auth/IdFindPage';

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

        {/* test */}
        <Route path="/components-test" element={<Compoents />}></Route>

        {/* home */}
        <Route path="/" element={<Home />}></Route>
        <Route path="/controller-update/:id" element={<ControllerUpdatePage />}></Route>

        {/* auth */}
        <Route path="/signin" element={<SigninPage />}></Route>
        <Route path="/signup-agree" element={<SignupAgreePage />}></Route>
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="/signup-complete" element={<SignupCompletePage />}></Route>
        <Route path="/id-find" element={<IdFindPage />}></Route>
        <Route path="/password-reset" element={<PasswordResetPage />}></Route>
      </Routes>
    </ControllerProvider>
  )
}

export default App
