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
import PrivacyPage from './pages/my/PrivacyPage';
import TermsOfUsePage from './pages/my/TermsOfUsePage';
import EventNotificationPage from './pages/my/EventNotificationPage';
import DataCollectionPage from './pages/my/DataCollectionPage';
import LoginHistoryPage from './pages/my/LoginHistoryPage';
import NotificationSettingsPage from './pages/my/NotificationSettingsPage';

import MonitoringPage from './pages/monitoring/MonitoringPage';

import ScheduledBlockingPage from './pages/scheduled-block/ScheduledBlockingPage';
import ScheduledDeletePage from './pages/scheduled-block/ScheduledDeletePage';
import ScheduledAddPage from './pages/scheduled-block/ScheduledAddPage';
import AutoBlockPage from './pages/auto-block/AutoBlockPage';
import AutoBlockUpdagePage from './pages/auto-block/AutoBlockPageUpdate';
import ManualControlPage from './pages/manual-control/ManualControlPage ';
import AlarmPage from './pages/AlarmPage';
import AlarmFilterPage from './pages/AlarmFilterPage';
import FullScreenLoading from './components/ui/FullScreenLoading';
import { useEffect, useState } from 'react';


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
    <ControllerProvider>
      <Routes>

        {/* 테스트페이지 */}
        <Route path="/components-test" element={<Compoents />}></Route>

        {/* 알림페이지 */}
        <Route path="/alarm" element={<AlarmPage />}></Route>
        <Route path="/alarm-filter" element={<AlarmFilterPage />}></Route>

        {/* 메인페이지 */}
        <Route path="/" element={<Home />}></Route>

        {/* 제어기 내용 변경 페이지 */}
        <Route path="/controller-update/:id" element={<ControllerUpdatePage />}></Route>

        {/* 수동제어 페이지 */}
        <Route path="/manual-control/:id" element={<ManualControlPage />} />

        {/* 인증페이지 */}
        <Route path="/signin" element={<SigninPage />}></Route>
        <Route path="/signup-agree" element={<SignupAgreePage />}></Route>
        <Route path="/signup" element={<SignupPage />}></Route>
        <Route path="/signup-complete" element={<SignupCompletePage />}></Route>
        <Route path="/id-find" element={<IdFindPage />}></Route>
        <Route path="/password-reset" element={<PasswordResetPage />}></Route>

        {/* 마이페이지 */}
        <Route path="/my" element={<MyPage />}></Route>
        <Route path="/my-account" element={<MyAccountPage />}></Route>
        <Route path="/withdraw-agree" element={<WithdrawAgreePage />}></Route>
        <Route path="/withdraw-confirm" element={<WithdrawConfirmPage />}></Route>
        <Route path="/edit-profile" element={<EditProfilePage />}></Route>
        <Route path="/member-management" element={<MembersPage />}></Route>
        <Route path="/privacy" element={<PrivacyPage />}></Route>
        <Route path="/terms" element={<TermsOfUsePage />}></Route>
        <Route path="/notifications-settings" element={<NotificationSettingsPage />} />
        <Route path="/data-collection" element={<DataCollectionPage />} />
        <Route path="/event-notifications" element={<EventNotificationPage />} />
        <Route path="/login-history" element={<LoginHistoryPage />} />

        {/* 모니터링페이지 */}
        <Route path="/monitoring" element={<MonitoringPage />} />

        {/* 예약차단페이지 */}
        <Route path="/scheduled-block" element={<ScheduledBlockingPage />} />
        <Route path="/scheduled-delete" element={<ScheduledDeletePage />} />
        <Route path="/scheduled-add" element={<ScheduledAddPage />} />

        {/* 자동차단페이지 */}
        <Route path="/auto-block" element={<AutoBlockPage />} />
        <Route path="/auto-block-update" element={<AutoBlockUpdagePage />} />

      </Routes>
    </ControllerProvider>
  )
}

export default App
