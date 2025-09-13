import type { User } from "../types/user";

// 사용자 아이디 중복 확인 (로컬 스토리지 기반)
function isUserIdDuplicate(userId: string): boolean {
  const storedUsers = localStorage.getItem("signupData");

  if (!storedUsers) {
    return false;
  }

  try {
    const users: { userId: string }[] = JSON.parse(storedUsers);
    return users.some(user => user.userId === userId);
  } catch (error) {
    console.error("유저 데이터 파싱 오류:", error);
    return false;
  }
}

// 아이디 유효성 검사 (회원가입용)
export function validateUserId(userId: string): string {
  const idRegex = /^[a-z0-9]{4,12}$/;

  if (!userId) {
    return "아이디를 입력해주세요.";
  }

  if (!idRegex.test(userId)) {
    return "4~12자의 영문 소문자, 숫자를 사용해 주세요.";
  }

  if (isUserIdDuplicate(userId)) {
    return "중복된 아이디입니다.";
  }

  return "";
}

// 아이디 유효성 검사 (비밀번호 재설정용)
export function validateUserIdForReset(userId: string, users: User[]): string {
  const idRegex = /^[a-z0-9]{4,12}$/;

  if (!userId) {
    return "아이디를 입력해주세요.";
  }

  if (!idRegex.test(userId)) {
    return "4~12자의 영문 소문자, 숫자를 사용해 주세요.";
  }

  const exists = users.some(user => user.userId === userId);
  if (!exists) {
    return "존재하지 않는 아이디입니다.";
  }

  return "";
}

// 비밀번호 유효성 검사
export function validatePassword(password: string): string {
  const pwRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s])[A-Za-z\d\S]{8,16}$/;

  if (!password) {
    return "비밀번호를 입력해주세요.";
  }

  if (!pwRegex.test(password)) {
    return "8~16자의 영문 대/소문자, 숫자, 특수문자를 사용해 주세요.";
  }

  return "";
}

// 비밀번호 재입력 유효성 검사
export function validatePasswordConfirm(password: string, confirm: string): string {
  if (!confirm) {
    return "비밀번호를 다시 입력해주세요.";
  }

  if (password !== confirm) {
    return "비밀번호가 일치하지 않습니다.";
  }

  return "";
}

// 이름 유효성 검사 (5자 이하 한글)
export function validateName(name: string): string {
  const nameRegex = /^[가-힣]{1,5}$/;

  if (!name) {
    return "이름을 입력해주세요.";
  }

  if (!nameRegex.test(name)) {
    return "5자 이하의 한글로 입력해 주세요.";
  }

  return "";
}

// 회사코드 유효성 검사 (예: 숫자 6자리)
export function validateCompanyCode(code: string): string {
  const codeRegex = /^\d{6}$/;

  if (!code) {
    return "회사코드를 입력해주세요.";
  }

  if (!codeRegex.test(code)) {
    return "올바른 회사코드를 입력해 주세요.";
  }

  return "";
}

// 직급 유효성 검사 (예: 정해진 값만 허용)
const allowedPositions = ["대표", "사원", "대리", "과장", "차장", "부장"];

export function validatePosition(position: string): string {
  if (!position) {
    return "직급을 입력해주세요.";
  }

  if (!allowedPositions.includes(position)) {
    return "올바른 직급을 입력해 주세요.";
  }

  return "";
}

// 이메일 유효성 검사
export function validateEmail(email: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return "이메일을 입력해주세요.";
  }

  if (!emailRegex.test(email)) {
    return "올바른 이메일을 입력해 주세요.";
  }

  return "";
}

// 전화번호 유효성 검사 (11자리 숫자)
export function validatePhone(phone: string): string {
  const phoneRegex = /^\d{11}$/;

  if (!phone) {
    return "전화번호를 입력해주세요.";
  }

  if (!phoneRegex.test(phone)) {
    return "올바른 전화번호를 입력해 주세요.";
  }

  return "";
}

// 인증번호 유효성 검사 (숫자 6자리 기준)
export function validateVerificationCode(code: string): string {
  const codeRegex = /^\d{6}$/;

  if (!code) {
    return "인증번호를 입력해주세요.";
  }

  if (!codeRegex.test(code)) {
    return "올바르지 않은 인증번호입니다.";
  }

  return "";
}
