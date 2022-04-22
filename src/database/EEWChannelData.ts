export interface EEWChannelData {
    /**
     * チャンネルID
     */
    channelid: string;

    /**
     * 通知する最小震度
     */
    min_intensity: number;

    /**
     * 通知する最小マグニチュード
     */
    min_magnitude: number;

    /**
     * 通知時にメンションするロールID配列
     */
    mention_roles: Array<string>;

    /**
     * M3.5以上の地震を通知するか
     */
    magnitude: number;
}