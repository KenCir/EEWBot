export interface VoiceSetting {
  guild_id: string;

  /**
     * 通知する最小震度
     */
  min_intensity: number;

  /**
   * M3.5以上の地震を通知するか
   */
  magnitude: number;
}
