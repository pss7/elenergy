// 리액트 라우터에서 URL 파라미터(id)를 사용하기 위한 훅
import { useParams } from "react-router-dom";

// 레이아웃 및 공통 컴포넌트
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Title from "../components/ui/Title";

// 스타일
import styles from "./MainPage.module.css";

// 전역 상태에서 제어기 데이터 사용
import { useControllerData } from "../contexts/ControllerContext";

// 상태관리 및 페이지 이동 훅
import { useState } from "react";
import useNavigateTo from "../hooks/useNavigateTo";

export default function ControllerUpdatePage() {

  // URL 파라미터에서 ID 가져오기
  const { id } = useParams();

  // 페이지 이동을 위한 커스텀 훅
  const { navigateTo } = useNavigateTo();

  // 전역 컨텍스트에서 제어기 데이터 및 업데이트 함수 가져오기
  const { controllers, setControllers } = useControllerData();

  // 해당 ID에 해당하는 제어기 정보 찾기
  const target = controllers.find(c => c.id === Number(id));

  // 입력 상태 및 에러 메시지 관리
  const [title, setTitle] = useState(target?.title ?? '');
  const [titleError, setTitleError] = useState("");
  const [location, setLocation] = useState(target?.location ?? '');
  const [locationError, setLocationError] = useState("");

  // 명칭 입력 핸들러 - 10자 이내인지 검사
  function handleTitle(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setTitle(value);

    if (value.length > 10) {
      setTitleError("10자 이내로 작성해 주세요.");
    } else {
      setTitleError("");
    }
  }

  // 위치 입력 핸들러 - 15자 이내인지 검사
  function handleLocation(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value;
    setLocation(value);

    if (value.length > 15) {
      setLocationError("15자 이내로 작성해 주세요.");
    } else {
      setLocationError("");
    }
  }

  // 수정 버튼 클릭 시 제어기 정보 업데이트 후 메인 페이지로 이동
  function handleSave() {
    setControllers(prev =>
      prev.map(c =>
        c.id === Number(id) ? { ...c, title, location } : c
      )
    );
    navigateTo('/');
  };

  // 취소 버튼 클릭 시 메인 페이지로 이동
  function handleCancel() {
    navigateTo('/');
  }

  // 유효하지 않은 ID일 경우
  if (!target) {
    return <p>제어기를 찾을 수 없습니다.</p>;
  }

  return (
    <Main id="main">
      {/* 제목 */}
      <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
        정보변경
      </Title>

      {/* 명칭 입력 영역 */}
      <div className={`${styles.inputTextBox} mb-20`}>
        <span>명칭</span>
        <Input
          type="text"
          value={title}
          onChange={handleTitle}
        />
        {titleError && <p className="errorMessage">{titleError}</p>}
      </div>

      {/* 위치 입력 영역 */}
      <div className={`${styles.inputTextBox} mb-20`}>
        <span>위치</span>
        <Input
          type="text"
          value={location}
          onChange={handleLocation}
        />
        {locationError && <p className="errorMessage">{locationError}</p>}
      </div>

      {/* 버튼 영역 */}
      <div className="btnBox">
        <Button
          styleType="grayType"
          onClick={handleCancel}
        >
          취소
        </Button>

        <Button
          styleType="tealType"
          onClick={handleSave}
        >
          수정
        </Button>
      </div>
    </Main>
  );
}
