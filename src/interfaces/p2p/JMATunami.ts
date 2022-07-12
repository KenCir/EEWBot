import { BasicData } from './BasicData';

export interface JMATunami extends BasicData {
  /** 津波予報が解除されたかどうか、trueの場合はareasは空配列になる */
  cancelled: boolean;

  issue: {
    /** 発表元 */
    source: string;

    /** 発表時刻 */
    time: string;

    /** 発表種類、今は津波予報(Focus)だけ */
    type: string;
  }

  areas: Array<{
    /** 津波予報の種類 */
    grade: string;

    /** 直ちに津波が到達すると予想されているか */
    immediate: boolean;

    /**
     * 津波予報区名
     */
    name: string;
  }>;
}
