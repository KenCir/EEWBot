import { spawn } from 'child_process';
import EEWBot from '../../EEWBot';
import notifyEEWReport from '../../functions/notifyEEWReport';
import EEWMonitor from '../../functions/KyoushinMonitor';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { VoiceChannel } from 'discord.js';

export default (client: EEWBot) => {
  client.user?.setActivity('/help');
  client.logger.info(`Logged in as ${client.user?.tag as string}`);

  client.database.getAllVoiceStatus().forEach(voiceStatus => {
    const guild = client.guilds.cache.get(voiceStatus.guild_id);
    if (!guild) {
      client.database.removeVoiceStatus(voiceStatus.guild_id);
      return;
    }

    const channel = client.channels.cache.get(voiceStatus.channel_id) as VoiceChannel;
    if (!channel) {
      client.database.removeVoiceStatus(voiceStatus.guild_id);
      return;
    }

    if (channel.members.filter(m => !m.user.bot).size < 1) return;
    client.voicevoxClient.add(voiceStatus.guild_id, voiceStatus.channel_id, guild.voiceAdapterCreator as DiscordGatewayAdapterCreator);
  });

  setInterval(() => {
    void EEWMonitor(client);
    void notifyEEWReport(client);
  }, 1000);

  // NHKのQuakeInfo 15秒遅延
  setInterval(() => {
    spawn('php', ['QuakeInfo.php']);
  }, 15000);
};
