const CHOSUNG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];

const HANGUL_START = 0xac00; // '가'
const HANGUL_END = 0xd7a3; // '힣'
const JUNG_JONG_COUNT = 21 * 28;

/** "소개팅" → ["ㅅ", "ㄱ", "ㅌ"] · 한글이 아닌 글자는 그대로 반환 */
export function toChosung(word) {
  return [...word].map(char => {
    const code = char.charCodeAt(0);
    if (code < HANGUL_START || code > HANGUL_END) return char;
    return CHOSUNG[Math.floor((code - HANGUL_START) / JUNG_JONG_COUNT)];
  });
}

/** 완성형 한글만 세기 (공백·기호 제외) */
export function countHangul(word) {
  return [...word].filter(char => {
    const code = char.charCodeAt(0);
    return code >= HANGUL_START && code <= HANGUL_END;
  }).length;
}
