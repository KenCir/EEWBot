import { VoiceConnection, AudioPlayer } from '@discordjs/voice';

export interface Speaker {
  guildId: string;

  channelId: string;

  connection: VoiceConnection;

  queue: Array<bigint>;

  player: AudioPlayer;
}
