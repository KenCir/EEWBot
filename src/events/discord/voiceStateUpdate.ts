import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { VoiceChannel, VoiceState } from 'discord.js';
import EEWBot from '../../EEWBot';

export default (client: EEWBot, oldState: VoiceState, newState: VoiceState) => {
  // 参加してたVCの人数がBot除いて0人になったら退出処理
  if (oldState.channelId === oldState.guild.members.me?.voice.channelId && oldState.channel !== null) {
    if ((oldState.channel as VoiceChannel).members.filter(m => !m.user.bot).size < 1) {
      const voicevoxClient = client.voicevoxClient.get(oldState.guild.id);
      if (voicevoxClient) {
        client.voicevoxClient.leave(oldState.guild.id);
      }
    }
  }
  // 対象のVCに誰かが参加したら入室処理
  else if (newState.channelId === client.database.getVoiceStatus(newState.guild.id)?.channel_id && (newState.channel as VoiceChannel).members.filter(m => !m.user.bot).size > 0 && !client.voicevoxClient.get(newState.guild.id)) {
    client.voicevoxClient.add(newState.guild.id, newState.channelId, newState.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator);
  }
};
