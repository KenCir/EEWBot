export interface EEWData {
    /**
     * 第何報か
     */
    report: number | string;

    /**
     * 発生時刻(UNIX)
     */
    time: string;

    /**
     * 震央
     */
    epicenter: string;

    /**
     * 震源の深さ
     */
    depth: string;

    /**
     * マグニチュード
     */
    magnitude: number;

    /**
     * 緯度
     */
    latitude: number;

    /**
     * 経度
     */
    longitude: number;

    /**
     * 震度
     */
    intensity: number | string;
}