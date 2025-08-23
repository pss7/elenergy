//컴포넌트
import { useNavigate, useParams } from "react-router-dom";
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Title from "../components/ui/Title";

//스타일
import styles from "./MainPage.module.css";
import { useControllerData } from "../contexts/ControllerContext";
import { useState } from "react";

export default function ControllerUpdatePage() {

  const { id } = useParams();
  const navigator = useNavigate();
  const { controllers, setControllers } = useControllerData();

  const target = controllers.find(c => c.id === Number(id));
  const [title, setTitle] = useState(target?.title ?? '');
  const [location, setLocation] = useState(target?.location ?? '');

  function handleSave() {
    setControllers(prev =>
      prev.map(c =>
        c.id === Number(id) ? { ...c, title, location } : c
      )
    );
    navigator('/');
  };

  function handleCancel() {
    navigator('/');
  }

  if (!target) {
    <p>제어기를 찾을 수 없습니다.</p>;
  }

  return (

    <Main id="main">
      <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
        내용변경
      </Title>

      <div className={`${styles.inputTextBox} mb-20`}>
        <span>
          명칭
        </span>
        <Input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </div>

      <div className={`${styles.inputTextBox} mb-20`}>
        <span>
          위치
        </span>
        <Input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>

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

  )

}