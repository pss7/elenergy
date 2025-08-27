export interface Member {
  id: number;
  name: string;
  position: string;
  role: string;
}

export interface Applicant {
  id: number;
  name: string;
  position: string;
  date: string;
}

interface MembersData {
  myInfo: Member;
  members: Member[];
  pendingMembers: Applicant[];
}

const membersData: MembersData = {
  myInfo: {
    id: 0,
    name: "김길동",
    position: "대표",
    role: "관리자",
  },
  members: [
    { id: 1, name: "최민지", position: "대리", role: "구성원" },
    { id: 2, name: "박지원", position: "팀장", role: "구성원" },
    { id: 3, name: "이준영", position: "부장", role: "구성원" },
  ],
  pendingMembers: [
    { id: 101, name: "하예슬", position: "대리", date: "2025.12.01" },
  ],
};

export default membersData;