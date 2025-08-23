//로컬스토리지 사용자 확인 함수
function isUserIdDuplicate(userId: string): boolean {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  return users.some((user: { userId: string }) => user.userId === userId);
}

//아이디 유효성 검사 함수
export function validateUserId(userId: string): string {
  const idRegex = /^[a-zA-Z0-9]{5,20}$/;

  if (!userId) return "아이디를 입력해주세요.";
  if (!idRegex.test(userId)) return "5~20자의 영문자 또는 숫자를 사용하세요.";

  const isDuplicate = isUserIdDuplicate(userId);
  if (isDuplicate) return "이미 사용 중인 아이디입니다.";

  return "";
}

//비밀번호 유효성 검사 함수
export function validatePassword(password: string): string {
  const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!password) return "비밀번호를 입력해주세요.";
  if (!pwRegex.test(password)) {
    return "비밀번호는 영문 + 숫자 포함 8자 이상입니다.";
  }
  return "";
}

//이메일 유효성 검사 함수
export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "이메일을 입력해주세요.";
  if (!emailRegex.test(email)) return "유효한 이메일 주소를 입력해주세요.";
  return "";
}

//전화번호 유효성 검사 함수
export function validatePhone(phone: string): string {
  const phoneRegex = /^\d{10,11}$/;
  if (!phone) return "전화번호를 입력해주세요.";
  if (!phoneRegex.test(phone)) return "숫자만 입력해주세요.";
  return "";
}
