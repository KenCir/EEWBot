// EEW用の時間(yyyyMMdd--)を取得(4秒遅延させてます)
export function getEEWTime(): string {
    const date = new Date(new Date().toLocaleString('JST'));
    date.setSeconds(date.getSeconds() - 2);

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return `${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}/${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}${('0' + date.getHours()).slice(-2)}${('0' + date.getMinutes()).slice(-2)}${('0' + (date.getSeconds() - 1)).slice(-2)}`;
}