// src/pages/ControllerUpdatePage.tsx
import { useParams } from "react-router-dom";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Title from "../components/ui/Title";
import styles from "./MainPage.module.css";
import { useControllerData } from "../contexts/ControllerContext";
import { useState, useMemo } from "react";
import useNavigateTo from "../hooks/useNavigateTo";

const MAX_LEN = 15;

export default function ControllerUpdatePage() {
  const { id } = useParams();
  const { navigateTo } = useNavigateTo();
  const { controllers, setControllers } = useControllerData();

  const numericId = Number(id);
  const target = controllers.find((c) => c.id === numericId);

  const [title, setTitle] = useState(target?.title ?? "");
  const [location, setLocation] = useState(target?.location ?? "");

  const titleTrim = title.trim();
  const locationTrim = location.trim();

  // ❗ 15자를 '넘으면'만 에러 문구 노출 (입력은 막지 않음)
  const titleError =
    titleTrim.length > MAX_LEN ? `${MAX_LEN}자 이내로 작성해주세요.` : "";
  const locationError =
    locationTrim.length > MAX_LEN ? `${MAX_LEN}자 이내로 작성해주세요.` : "";

  // 저장 가능 조건: 둘 다 1~15자
  const canSave = useMemo(() => {
    const okTitle = titleTrim.length >= 1 && titleTrim.length <= MAX_LEN;
    const okLocation = locationTrim.length >= 1 && locationTrim.length <= MAX_LEN;
    return okTitle && okLocation;
  }, [titleTrim, locationTrim]);

  function handleSave() {
    if (!target || !canSave) return;
    setControllers((prev) =>
      prev.map((c) =>
        c.id === numericId ? { ...c, title: titleTrim, location: locationTrim } : c
      )
    );
    navigateTo("/");
  }

  function handleCancel() {
    navigateTo("/");
  }

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
          onChange={(e) => setTitle(e.target.value)} // 입력은 자유롭게
          aria-invalid={titleTrim.length > MAX_LEN}
          aria-describedby="title-error"
        />
        {titleError && (
          <p id="title-error" className="errorMessage">
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
          onChange={(e) => setLocation(e.target.value)} // 입력은 자유롭게
          aria-invalid={locationTrim.length > MAX_LEN}
          aria-describedby="location-error"
        />
        {locationError && (
          <p id="location-error" className="errorMessage">
            {locationError}
          </p>
        )}
      </div>

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
