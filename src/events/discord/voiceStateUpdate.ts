import { VoiceState } from 'discord.js';
import EEWBot from '../../EEWBot';

export default (client: EEWBot, oldState: VoiceState, newState: VoiceState) => {
  if (!newState.guild.me?.voice && client.database.hasVoiceStatus(newState.channelId as string)) {
    client.database.removeVoiceStatus(newState.channelId as string);
  }
};
