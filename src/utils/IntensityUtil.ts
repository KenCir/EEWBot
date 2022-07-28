export function intensityStringToNumber(intensity: string | number): number {
  switch (intensity) {
    case 10:
      return 1;
    case 20:
      return 2;
    case 30:
      return 3;
    case 40:
      return 4;
    case 45:
    case 46:
    case '5弱':
    case '5-':
      return 5;
    case 50:
    case '5強':
    case '5+':
      return 5.5;
    case 55:
    case '6弱':
    case '6-':
      return 6;
    case 60:
    case '6強':
    case '6+':
      return 6.5;
    case 70:
    case -1:
      return 7;
    default:
      {
        if (Number(intensity)) return Number(intensity);
        else return -1;
      }
  }
}

export function intensityNumberToString(intensity: number): string {
  switch (intensity) {
    case 1:
    case 10:
      return '震度1';
    case 2:
    case 20:
      return '震度2';
    case 3:
    case 30:
      return '震度3';
    case 4:
    case 40:
      return '震度4';
    case 5:
    case 45:
      return '震度5弱';
    case 5.5:
    case 50:
      return '震度5強';
    case 6:
    case 55:
      return '震度6弱';
    case 6.5:
    case 60:
      return '震度6強';
    case 7:
    case 70:
      return '震度7';
    case 46:
      return '震度5弱以上と予想されるが震度情報が入っていない';
    case -1:
      return '震度情報なし';
    default:
      // 通常なら絶対ない
      return 'Unknown';
  }
}
