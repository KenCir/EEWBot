/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import axios from 'axios';
import { createWriteStream } from 'fs';
import sharp from 'sharp';
import { getEEWTime } from '../utils/Time';

export default async () => {
    try {
        const remoteBaseURL = 'http://www.kmoni.bosai.go.jp/data/map_img/';
        const date = new Date();
        date.setSeconds(date.getSeconds() - 2);

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const monitor = await axios.get(`${remoteBaseURL}RealTimeImg/jma_s/${getEEWTime()}.jma_s.gif`, {
            responseType: 'stream',
            proxy: false,
        });
        monitor.data.pipe(createWriteStream('dat/monitor.png'));

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        const PSMoniter = await axios.get(`${remoteBaseURL}PSWaveImg/eew/${date.getFullYear()}${('0' + (date.getMonth() + 1)).slice(-2)}${('0' + date.getDate()).slice(-2)}/${getEEWTime()}.eew.gif`, {
            responseType: 'stream',
            proxy: false,
        });
        PSMoniter.data.pipe(createWriteStream('dat/PSWave.png'));

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
        return false;
    }
};