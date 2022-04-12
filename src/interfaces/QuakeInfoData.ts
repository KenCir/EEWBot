export interface QuakeInfoData {
    /**
     * 地震ID
     */
    id: string;

    /**
     * 発生時刻
     */
    time: string;

    /**
     * 発生時刻
     */
    epicenter: string;

    /**
     * 震源の深さ
     */
    depth: string;

    /**
     * マグニチュード
     */
    magnitude: string;

    /**
     * 最大震度
     */
    intensity: string;

    /**
     * 北緯
     */
    latitudey: string;

    /**
     * 東経
     */
    longitude: string;

    /**
     * 震度マップ(概況)
     */
    detail: string;

    /**
     * 震度マップ(拡大)
     */
    local: string;

    /**
     * 震度マップ(広域)
     */
    global: string;

    /**
     * 各地の観測震度
     */
    relatives: Array<{ intensity: string, points: Array<string> }>;
}