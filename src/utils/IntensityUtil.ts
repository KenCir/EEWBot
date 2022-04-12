export function intensityStringToNumber(intensity: string): number {
    if (Number(intensity)) return Number(intensity);

    switch (intensity) {
        case '5弱':
            return 5;
        case '5強':
            return 5.5;
        case '6弱':
            return 6;
        case '6強':
            return 6.5;
        default:
            return -1;
    }
}

export function intensityNumberToString(intensity: number): string {
    switch (intensity) {
        case 1:
            return '震度1';
        case 2:
            return '震度2';
        case 3:
            return '震度3';
        case 4:
            return '震度4';
        case 5:
            return '震度5弱';
        case 5.5:
            return '震度5強';
        case 6:
            return '震度6弱';
        case 6.5:
            return '震度6強';
        case 7:
            return '震度7';
        default:
            // 通常なら絶対ない
            return 'Unkown';
    }
}