import { useState } from "react";
import Header from "../../components/layout/Header";
import Main from "../../components/layout/Main";
import Button from "../../components/ui/Button";
import styles from "./MyPage.module.css";
import membersData, { type Applicant, type Member } from "../../data/Members";


export default function MembersPage() {

  const { myInfo, members, pendingMembers } = membersData

  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);

  function handleSettingToggle(id: number) {
    setActiveMemberId(prev => (prev === id ? null : id));
  }

  function handleActionClick() {
    setActiveMemberId(null);
  }

  return (
    <>
      <Header type="pageLink" title="구성원 관리" prevLink="/my" />
      <Main id="sub">
        <div className={styles.memberBox}>
          <div className={styles.memberListBox}>
            <h2 className={styles.title}>본인</h2>
            <ul className={styles.memberList}>
              <li>
                <div className={styles.textBox}>
                  <h3>{myInfo.name}<em>{myInfo.position}</em></h3>
                  <span>{myInfo.role}</span>
                </div>
                <div className={styles.imgBox}>
                  <img src="/assets/images/sub/profile_img.svg" alt="" />
                </div>
              </li>
            </ul>
          </div>

          <div className={styles.memberListBox}>
            <h2 className={styles.title}>구성원</h2>
            <ul className={styles.memberList}>
              {members.map((member: Member) => (
                <li key={member.id}>
                  <div className={styles.textBox}>
                    <h3>{member.name}<em>{member.position}</em></h3>
                    <span>{member.role}</span>
                  </div>
                  <div className={styles.imgBox}>
                    <img src="/assets/images/sub/member_icon.svg" alt="" />
                  </div>

                  <div className={styles.settingBtnBox}>
                    <button
                      className={styles.settingBtn}
                      onClick={() => handleSettingToggle(member.id)}
                    >
                      <span className="blind">삭제하기, 관리자부여 버튼</span>
                    </button>

                    <ul className={`${styles.settingSelectBtn} ${activeMemberId === member.id ? styles.active : ""}`}>
                      <li>
                        <button className={styles.selectBtn} onClick={handleActionClick}>
                          삭제하기
                        </button>
                      </li>
                      <li>
                        <button className={styles.selectBtn} onClick={handleActionClick}>
                          관리자부여
                        </button>
                      </li>
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.memberListBox}>
            <h2 className={styles.title}>신청관리</h2>
            <ul className={styles.memberList}>
              {pendingMembers.map((applicant: Applicant) => (
                <li key={applicant.id}>
                  <div className={styles.textBox}>
                    <h3>{applicant.name}<em>{applicant.position}</em></h3>
                    <span>신청일: {applicant.date}</span>
                  </div>
                  <div className={styles.btnBox}>
                    <Button className={styles.btn}>수락하기</Button>
                    <Button className={styles.btn} styleType="grayType">거절하기</Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Main>
    </>
  );
}
