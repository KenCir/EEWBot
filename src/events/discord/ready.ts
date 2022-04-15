import { spawn } from 'child_process';
import EEWBot from '../../EEWBot';
import EEWReport from '../../functions/notifyEEWReport';
import EEWMonitor from '../../functions/KyoushinMonitor';

export default (client: EEWBot) => {
    client.user?.setActivity(`${process.env.PREFIX as string}help`);
    client.logger.info(`Logged in as ${client.user?.tag as string}`);

    setInterval(() => {
        void EEWMonitor(client);
        void EEWReport(client);
    }, 1000);

    setInterval(() => {
        spawn('php', ['QuakeInfo.php']);
    }, 15000);
};