import { createWriteStream, WriteStream } from 'fs';
import { getMonitorTime } from '../utils/Time';
import { read } from 'jimp';
import axios from 'axios';
import EEWBot from '../EEWBot';

export default async (client: EEWBot): Promise<void> => {
  try {
    const remoteBaseURL = 'http://www.kmoni.bosai.go.jp/data/map_img/';
    let tryCount = 0;

    while (tryCount <= 3) {
      tryCount++;

      try {
        const monitor = await axios.get<WriteStream>(`${remoteBaseURL}RealTimeImg/jma_s/${getMonitorTime(tryCount)}.jma_s.gif`, {
          timeout: 100,
          responseType: 'stream',
        });

        if (monitor.status !== 200 || !monitor.data) {
          continue;
        }
        monitor.data.pipe(createWriteStream('dat/monitor.png'));

        const PSMoniter = await axios.get<WriteStream>(`${remoteBaseURL}PSWaveImg/eew/${getMonitorTime(tryCount)}.eew.gif`, {
          timeout: 100,
          responseType: 'stream',
        });
        if (PSMoniter.status !== 200 || !PSMoniter.data) {
          continue;
        }
        PSMoniter.data.pipe(createWriteStream('dat/PSWave.png'));
      }
      catch (error) {
        continue;
      }
    }

    try {
      const img = await read('dat/baseMonitor.png');
      const monitorImg = await read('dat/monitor.png');
      const psWaveImg = await read('dat/PSWave.png');
      const baseJMA = await read('dat/baseJMA.png');
      img.blit(monitorImg, 0, 0);
      img.blit(psWaveImg, 0, 0);
      img.blit(baseJMA, 310, 90);
      await img.writeAsync('dat/nowMonitor.png');
    }
    // eslint-disable-next-line no-empty
    catch (e) { }
  }
  catch (e) {
    client.logger.error(e);
  }
};
