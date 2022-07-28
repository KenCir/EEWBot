import { BasicData } from './BasicData';

export interface JMAQuake extends BasicData {
  issue: {
    /**
     * 発表元
     */
    source: string;

    /**
     * 発表時刻
     */
    time: string;

    /**
     * 発表種類
     *
     * ScalePrompt 震度速報
     * Destination: 震源に関する情報
     * ScaleAndDestination: 震度・震源に関する情報
     * DetailScale: 各地の震度に関する情報
     * Foreign: 遠地地震に関する情報
     * Other: その他
     */
    type: 'ScalePrompt' | 'Destination' | 'ScaleAndDestination' | 'DetailScale' | 'Foreign' | 'Other';

    /**
     * 訂正の有無
     *
     * None: 無し
     * Unknown: 不明
     * ScaleOnly: 震度
     * DestinationOnly: 震源
     * ScaleAndDestination: 震度・震源
     */
    correct: 'None' | 'Unknown' | 'ScaleOnly' | 'DestinationOnly' | 'ScaleAndDestination';
  }

  earthquake: {
    /**
     * 発生時刻
     */
    time: string;

    /**
     * 震源情報
     */
    hypocenter: {
      /**
       * 名称
       */
      name: string;

      /**
       * 緯度
       * 存在しない場合 -200
       */
      latitude: number;

      /**
       * 経度
       * 存在しない場合 -200
       */
      longitude: number;

      /**
       * 震源の深さ
       * 0はごく浅い
       * -1は存在しない
       */
      depth: number;

      /**
       * マグニチュード
       * 存在しない場合 -1
       */
      magnitude: number;
    }

    /**
     * 最大震度
     * -1 震度情報なし
     * 10 震度1
     * 20 震度2
     * 30 震度3
     * 40 震度4
     * 45: 震度5弱
     * 50: 震度5強
     * 55: 震度6弱
     * 60: 震度6強
     * 70: 震度7
     */
    maxScale: -1 | 10 | 20 | 30 | 40 | 45 | 50 | 55 | 60 | 70;

    /**
     * 国内への津波の有無
     *
     * None なし
     * Unknown 不明
     * Checking 調査中
     * NonEffective 若干の海面変動が予想されるが、被害の心配なし
     * Watch 津波注意報
     * Warning 津波予報(種類不明)
     */
    domesticTsunami: 'None' | 'Unknown' | 'Checking' | 'NonEffective' | 'Watch' | 'Warning';

    /**
     * 海外への津波の有無
     *
     * None なし
     * Unknown 不明
     * Checking 調査中
     * NonEffectiveNearby 震源の近傍で小さな津波の可能性があるが、被害の心配なし
     * WarningNearby 震源の近傍で津波の可能性がある
     * WarningPacific 太平洋で津波の可能性がある
     * WarningPacificWide 太平洋の広域で津波の可能性がある
     * WarningIndian インド洋で津波の可能性がある
     * WarningIndianWide インド洋の広域で津波の可能性がある
     * Potential 一般にこの規模では津波の可能性がある
     */
    foreignTsunami: 'None' | 'Unknown' | 'Checking' | 'NonEffectiveNearby' | 'WarningNearby' | 'WarningPacific' | 'WarningPacificWide' | 'WarningIndian' | 'WarningIndianWide' | 'Potential';
  }

  /**
   * 観測地点
   */
  points: Array<{
    /**
     * 都道府県
     */
    pref: string;

    /**
     * 震度観測点名称
     */
    addr: string;

    /**
     * 区域名か
     */
    isArea: boolean;

    /**
     * 観測震度
     *
     * 10 震度1
     * 20 震度2
     * 30 震度3
     * 40 震度4
     * 45 震度5弱
     * 46 震度5弱以上と推定されるが震度情報を入手していない
     * 50 震度5強
     * 55 震度6弱
     * 60 震度6強
     * 70 震度7
     */
    scale: 10 | 20 | 30 | 40 | 45 | 46 | 50 | 55 | 60 | 70;
  }>;
}
