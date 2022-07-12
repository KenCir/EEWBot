export function tunamiEnumToString(type: string): string {
  switch (type) {
    case 'Watch':
      return '津波注意報';
    case 'Warning':
      return '津波警報';
    case 'MajorWarning':
      return '大津波警報';
    case 'Unknown':
    default:
      return '不明';
  }
}
