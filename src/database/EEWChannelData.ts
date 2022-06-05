export interface EEWChannelData {
  /**
   * チャンネルID
   */
  channel_id: string;

  /**
   * 通知する最小震度
   */
  min_intensity: number;

  /**
   * 通知時にメンションするロールID配列
   */
  mention_roles: Array<string>;
}
