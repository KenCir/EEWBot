export function tunamiEnumToString(type: string): string {
  switch (type) {
    case 'None':
      return 'なし';
    case 'Checking':
      return '調査中';
    case 'NonEffective':
      return '若干の海面変動が予想されるが、被害の心配なし';
    case 'Watch':
      return '津波注意報';
    case 'Warning':
      return '津波警報';
    case 'MajorWarning':
      return '大津波警報';
    case 'NonEffectiveNearby':
      return '震源の近傍で小さな津波の可能性があるが、被害の心配なし';
    case 'WarningNearby':
      return '震源の近傍で津波の可能性がある';
    case 'WarningPacific':
      return '太平洋で津波の可能性がある';
    case 'WarningPacificWide':
      return '太平洋の広域で津波の可能性がある';
    case 'WarningIndian':
      return 'インド洋で津波の可能性がある';
    case 'WarningIndianWide':
      return 'インド洋の広域で津波の可能性がある';
    case 'Potential':
      return '一般にこの規模では津波の可能性がある';
    case 'Unknown':
    default:
      return '不明';
  }
}
