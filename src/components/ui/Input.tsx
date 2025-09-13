import React, { useRef, useState } from "react";
import styles from "./Input.module.css";

/**
 * 사용법:
 *  - 글자수 제한: maxLength={12} (number)
 *  - 허용 문자 제한:
 *      allowedChars="digits"         // 0-9
 *      allowedChars="alpha"          // a-zA-Z
 *      allowedChars="alnum"          // a-zA-Z0-9
 *      allowedChars="hangul"         // 가-힣
 *      allowedChars="hangul-alpha"   // 가-힣a-zA-Z
 *      allowedChars="hangul-alnum"   // 가-힣a-zA-Z0-9
 *      또는 allowedPattern={/^[a-z0-9_-]*$/i}  // 커스텀 정규식 (전체 문자열 매치)
 *
 *  - IME(한글) 조합 중에는 막지 않고, 조합이 끝난 시점에 한 번 정리해줍니다.
 *  - 붙여넣기/드롭/입력 모두에서 최종적으로 필터링합니다.
 */

type AllowedPreset =
  | "digits"
  | "alpha"
  | "alnum"
  | "hangul"
  | "hangul-alpha"
  | "hangul-alnum";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  allowedChars?: AllowedPreset;
  /** 전체 문자열이 이 패턴에 매치되도록 강제 (allowedChars보다 우선) */
  allowedPattern?: RegExp;
}

function presetToRegex(preset?: AllowedPreset): RegExp | null {
  switch (preset) {
    case "digits":
      return /^[0-9]*$/;
    case "alpha":
      return /^[A-Za-z]*$/;
    case "alnum":
      return /^[A-Za-z0-9]*$/;
    case "hangul":
      return /^[가-힣]*$/;
    case "hangul-alpha":
      return /^[가-힣A-Za-z]*$/;
    case "hangul-alnum":
      return /^[가-힣A-Za-z0-9]*$/;
    default:
      return null;
  }
}

export default function Input({
  id,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  maxLength,
  allowedChars,
  allowedPattern,
  onPaste,
  onDrop,
  onInput,
  onCompositionStart,
  onCompositionEnd,
  ...rest
}: InputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // 허용 패턴 결정: allowedPattern > allowedChars
  const allowRegex =
    allowedPattern ??
    presetToRegex(allowedChars) ??
    null; // 없으면 무제한

  /** 문자열을 제한 규칙에 맞게 정리 */
  function sanitizeString(raw: string): string {
    let s = raw;

    // allowedRegex가 있으면: 전체가 패턴에 맞지 않으면 한 글자씩 필터링
    if (allowRegex && !allowRegex.test(s)) {
      // "전체 매치" 패턴을 "문자 단위"로 약식 필터링
      // 예: /^[A-Za-z0-9]*$/ 이면, 각 문자도 동일 도메인만 통과
      const charAllow =
        allowedPattern ||
        (() => {
          switch (allowedChars) {
            case "digits":
              return /[0-9]/;
            case "alpha":
              return /[A-Za-z]/;
            case "alnum":
              return /[A-Za-z0-9]/;
            case "hangul":
              return /[가-힣]/;
            case "hangul-alpha":
              return /[가-힣A-Za-z]/;
            case "hangul-alnum":
              return /[가-힣A-Za-z0-9]/;
            default:
              return null;
          }
        })();

      if (charAllow instanceof RegExp) {
        s = Array.from(s)
          .filter((ch) => charAllow.test(ch))
          .join("");
      } else {
        // 커스텀 allowedPattern인데 전체 매치 실패: 허용을 강제할 수 없으니 원본 유지
        // (필요 시, 여기서 커스텀 로직으로 잘라낼 수 있음)
      }
    }

    // 길이 제한
    if (typeof maxLength === "number" && maxLength > 0 && s.length > maxLength) {
      s = s.slice(0, maxLength);
    }

    return s;
  }

  /** 사용자가 타이핑/붙여넣기 등으로 입력했을 때(값이 바뀐 직후) */
  function handleInput(e: React.FormEvent<HTMLInputElement>) {
    // IME 조합 중에는 건드리지 않음
    if (isComposing) {
      onInput?.(e);
      return;
    }

    const el = e.currentTarget;
    const sanitized = sanitizeString(el.value);

    if (el.value !== sanitized) {
      const sel = el.selectionStart ?? sanitized.length;
      el.value = sanitized; // 네이티브 값 직접 반영(언컨트롤드/컨트롤드 모두 커버)
      // 커서 위치 유지 시도
      try {
        el.setSelectionRange(sel, sel);
      } catch {}

      // 부모 onChange에 "정리된 값"을 알려주기 위한 SyntheticEvent 유사 객체
      if (onChange) {
        const synthetic = {
          ...e,
          target: { ...el, value: sanitized },
          currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    } else {
      onInput?.(e);
      // 값이 같아도 부모 onChange가 필요하다면 여기서 호출 가능(일반적으로 불필요)
    }
  }

  /** 붙여넣기 시도 직전에 원천 차단/정리 */
  function handlePaste(ev: React.ClipboardEvent<HTMLInputElement>) {
    const text = ev.clipboardData.getData("text");
    const sanitized = sanitizeString(text);
    if (text !== sanitized) {
      ev.preventDefault();
      // 직접 삽입
      const el = ev.currentTarget;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const next = el.value.slice(0, start) + sanitized + el.value.slice(end);
      el.value = sanitizeString(next);

      // 커서 이동
      const pos = (start + sanitized.length);
      try { el.setSelectionRange(pos, pos); } catch {}

      // 부모 onChange 호출
      if (onChange) {
        const synthetic = {
          ...ev,
          target: { ...el, value: el.value },
          currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    }
    onPaste?.(ev);
  }

  /** 드래그 드롭으로 텍스트 투입 방어 */
  function handleDrop(ev: React.DragEvent<HTMLInputElement>) {
    const text = ev.dataTransfer.getData("text");
    if (text) {
      ev.preventDefault();
      const el = ev.currentTarget;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const next = el.value.slice(0, start) + sanitizeString(text) + el.value.slice(end);
      el.value = sanitizeString(next);

      const pos = (start + sanitizeString(text).length);
      try { el.setSelectionRange(pos, pos); } catch {}

      if (onChange) {
        const synthetic = {
          ...ev,
          target: { ...el, value: el.value },
          currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    }
    onDrop?.(ev);
  }

  /** IME 조합 시작/종료 */
  function handleCompositionStart(e: React.CompositionEvent<HTMLInputElement>) {
    setIsComposing(true);
    onCompositionStart?.(e);
  }
  function handleCompositionEnd(e: React.CompositionEvent<HTMLInputElement>) {
    setIsComposing(false);
    // 조합 종료 시 최종 한 번 정리
    const el = e.currentTarget;
    const sanitized = sanitizeString(el.value);
    if (el.value !== sanitized) {
      el.value = sanitized;
      if (onChange) {
        const synthetic = {
          ...e,
          target: { ...el, value: sanitized },
          currentTarget: el,
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(synthetic);
      }
    }
    onCompositionEnd?.(e);
  }

  return (
    <input
      ref={ref}
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={[styles.input, className].filter(Boolean).join(" ")}
      maxLength={maxLength}
      onInput={handleInput}
      onPaste={handlePaste}
      onDrop={handleDrop}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      {...rest}
    />
  );
}
