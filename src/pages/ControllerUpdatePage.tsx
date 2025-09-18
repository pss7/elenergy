import { useParams } from "react-router-dom";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Title from "../components/ui/Title";
import styles from "./MainPage.module.css";
import { useControllerData } from "../contexts/ControllerContext";
import { useState, useMemo } from "react";
import useNavigateTo from "../hooks/useNavigateTo";
import { logAlarm } from "../utils/logAlarm";

const MAX_LEN = 15;

export default function ControllerUpdatePage() {

  //URL 파라미터로 대상 제어기 식별
  const { id } = useParams();
  const numericId = Number(id);

  //네비게이션/컨텍스트 훅
  const { navigateTo } = useNavigateTo();
  const { controllers, setControllers } = useControllerData();

  //대상 제어기 조회
  const target = controllers.find((c) => c.id === numericId);

  //입력 상태 (초기값: 대상의 기존 값)
  const [title, setTitle] = useState(target?.title ?? "");
  const [location, setLocation] = useState(target?.location ?? "");

  //저장 시 사용할 트림 값
  const titleTrim = title.trim();
  const locationTrim = location.trim();

  //안내 문구: **15자 도달(또는 붙여넣기 초과 시 슬라이스된 결과가 15자)** 일 때만 노출
  const titleError = title.length >= MAX_LEN ? `${MAX_LEN}자 이내로 작성해주세요.` : "";
  const locationError = location.length >= MAX_LEN ? `${MAX_LEN}자 이내로 작성해주세요.` : "";

  //저장 가능: 각 필드 1~15자 (빈 값은 저장 불가지만, 안내 문구는 띄우지 않음)
  const canSave = useMemo(() => {
    const okTitle = titleTrim.length >= 1 && titleTrim.length <= MAX_LEN;
    const okLocation = locationTrim.length >= 1 && locationTrim.length <= MAX_LEN;
    return okTitle && okLocation;
  }, [titleTrim, locationTrim]);

  //입력 핸들러: 15자 초과 입력(타이핑/붙여넣기)을 즉시 차단
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTitle(v.length <= MAX_LEN ? v : v.slice(0, MAX_LEN));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocation(v.length <= MAX_LEN ? v : v.slice(0, MAX_LEN));
  };

  //저장: 컨텍스트 업데이트 + 알림 로그 + 홈으로 이동
  function handleSave() {
    if (!target || !canSave) return;

    setControllers((prev) =>
      prev.map((c) =>
        c.id === numericId ? { ...c, title: titleTrim, location: locationTrim } : c
      )
    );

    //변경 이벤트를 '수동제어'로 기록 (스키마상 status는 ON 고정 사용)
    logAlarm({
      type: "수동제어",
      controller: titleTrim,
      status: "ON",
    });

    navigateTo("/");
  }

  //취소: 홈으로 이동
  function handleCancel() {
    navigateTo("/");
  }

  //잘못된 ID 처리
  if (!target) return <p>제어기를 찾을 수 없습니다.</p>;

  return (
    <Main id="main">
      <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
        정보변경
      </Title>

      {/* 명칭 */}
      <div className={`${styles.inputTextBox} mb-20`}>
        <span>명칭</span>
        <Input
          type="text"
          value={title}
          onChange={handleTitleChange}
          maxLength={MAX_LEN} // 브라우저 레벨 제한
          aria-invalid={!!titleError}
          aria-describedby="title-error"
          placeholder="제어기 명칭을 입력하세요 (최대 15자)"
        />
        {/* 15자 도달 시에만 안내 문구 표시 */}
        {titleError && (
          <p id="title-error" className="errorMessage" style={{ marginTop: 4 }}>
            {titleError}
          </p>
        )}
      </div>

      {/* 위치 */}
      <div className={`${styles.inputTextBox} mb-20`}>
        <span>위치</span>
        <Input
          type="text"
          value={location}
          onChange={handleLocationChange}
          maxLength={MAX_LEN}
          aria-invalid={!!locationError}
          aria-describedby="location-error"
          placeholder="위치를 입력하세요 (최대 15자)"
        />
        {/* 15자 도달 시에만 안내 문구 표시 */}
        {locationError && (
          <p id="location-error" className="errorMessage" style={{ marginTop: 4 }}>
            {locationError}
          </p>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="btnBox">
        <Button styleType="grayType" onClick={handleCancel}>
          취소
        </Button>
        <Button styleType="tealType" onClick={handleSave} disabled={!canSave}>
          수정
        </Button>
      </div>
    </Main>
  );
}
