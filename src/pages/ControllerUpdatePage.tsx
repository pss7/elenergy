//컴포넌트
import Main from "../components/layout/Main";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Title from "../components/ui/Title";

//스타일
import styles from "./MainPage.module.css";



export default function ControllerUpdatePage() {

  return (
    <>

      <Main id="main">
        <Title level={1} className={`mb-20 ${styles.h1} ${styles.mainIcon01}`}>
          내용변경
        </Title>

        <div className={`${styles.inputTextBox} mb-20`}>
          <span>
            명칭
          </span>
          <Input />
        </div>

        <div className={`${styles.inputTextBox} mb-20`}>
          <span>
            위치
          </span>
          <Input />
        </div>

        <div className="btnBox">
          <Button type="grayType">
            취소
          </Button>

          <Button type="tealType">
            수정
          </Button>
        </div>

      </Main>

    </>
  )

}