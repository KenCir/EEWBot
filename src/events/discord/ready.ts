import { spawn } from 'child_process';
import EEWBot from '../../EEWBot';
import notifyEEWReport from '../../functions/notifyEEWReport';
import EEWMonitor from '../../functions/KyoushinMonitor';

export default (client: EEWBot) => {
  client.user?.setActivity('/help');
  client.logger.info(`Logged in as ${client.user?.tag as string}`);

  setInterval(() => {
    void EEWMonitor(client);
    void notifyEEWReport(client);
  }, 1000);

  // NHKのQuakeInfo 15秒遅延
  setInterval(() => {
    spawn('php', ['QuakeInfo.php']);
  }, 15000);
};
