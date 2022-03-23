import fetch from 'node-fetch';
import { createWriteStream } from 'fs';
import sharp from 'sharp';
import { getEEWTime } from '../utils/Time';

export default async () => {
    try {
        const remoteBaseURL = 'http://www.kmoni.bosai.go.jp/data/map_img/';

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const monitor = await fetch(`${remoteBaseURL}RealTimeImg/jma_s/${getEEWTime()}.jma_s.gif`);
        if (!monitor.ok || !monitor.body) {
            console.log(monitor);
            console.error('NOT OK');
            return;
        }

        monitor.body.pipe(createWriteStream('dat/monitor.png'));

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const PSMoniter = await fetch(`${remoteBaseURL}PSWaveImg/eew/${getEEWTime()}.eew.gif`);
        if (!PSMoniter.ok || !PSMoniter.body) {
            console.log(PSMoniter);
            console.error('NOT OK');
            return;
        }

        PSMoniter.body.pipe(createWriteStream('dat/PSWave.png'));

        await sharp('dat/baseMonitor.png')
            .composite([
                { input: 'dat/baseJMA.png', top: 90, left: 313 },
                { input: 'dat/monitor.png' },
                { input: 'dat/PSWave.png' },
            ])
            .toFile('dat/nowMonitor.png');

        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
};