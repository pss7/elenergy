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
import MyPage from './pages/my/MyPage';
import MyAccountPage from './pages/my/MyAccountPage';
import WithdrawAgreePage from './pages/my/WithdrawAgreePage';
import WithdrawConfirmPage from './pages/my/WithdrawConfirmPage';
import EditProfilePage from './pages/my/EditProfilePage';
import MembersPage from './pages/my/MembersPage';
import NotificationSettingsPage from './pages/my/NotificationSettingsPage';

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

        {/* my */}
        <Route path="/my" element={<MyPage />}></Route>
        <Route path="/my-account" element={<MyAccountPage />}></Route>
        <Route path="/withdraw-agree" element={<WithdrawAgreePage />}></Route>
        <Route path="/withdraw-confirm" element={<WithdrawConfirmPage />}></Route>
        <Route path="/edit-profile" element={<EditProfilePage />}></Route>
        <Route path="/member-management" element={<MembersPage />}></Route>
        <Route path="/notifications-settings" element={<NotificationSettingsPage />}></Route>

      </Routes>
    </ControllerProvider>
  )
}

export default App
