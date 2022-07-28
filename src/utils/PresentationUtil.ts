export function expresentationTypeEnumToString(type: string): string {
  switch (type) {
    case 'ScalePrompt':
      return '震度速報';
    case 'Destination':
      return '震源に関する情報';
    case 'ScaleAndDestination':
      return '震度・震源に関する情報';
    case 'DetailScale':
      return '各地の震度に関する情報';
    case 'Foreign':
      return '遠地地震に関する情報';
    case 'Other':
    default:
      return 'その他';
  }
}
