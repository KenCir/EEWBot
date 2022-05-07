import { spawn } from 'child_process';
import EEWBot from '../../EEWBot';
import notifyEEWReport from '../../functions/notifyEEWReport';
import EEWMonitor from '../../functions/KyoushinMonitor';

export default (client: EEWBot) => {
    client.user?.setActivity('/help');
    client.logger.info(`Logged in as ${client.user?.tag as string}`);

    void client.voicevoxClient.notify('テスト');

    setInterval(() => {
        void EEWMonitor(client);
        void notifyEEWReport(client);
    }, 15000);

    setInterval(() => {
        spawn('php', ['QuakeInfo.php']);
    }, 15000);
};