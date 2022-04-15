export interface QuakeInfoChannelData {
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
     * 震度マップを投稿するか
     */
    image: number;

    /**
     * 各地の震度情報を投稿するか
     */
    relative: number;
}