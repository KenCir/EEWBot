export function check2000length(str: string): string {
  if (str.length <= 2000) return str;
  return '2000文字を超過しているため表示できません';
}
