import { AudioPlayerStatus, createAudioPlayer, createAudioResource, DiscordGatewayAdapterCreator, joinVoiceChannel } from '@discordjs/voice';
import axios, { AxiosInstance } from 'axios';
import { Collection, SnowflakeUtil } from 'discord.js';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import EEWBot from '../EEWBot';
import { Speaker } from '../interfaces/Speaker';

export default class VOICEVOXClient {
  public readonly client: EEWBot;
  public readonly api: AxiosInstance;
  public readonly speakers: Collection<string, Speaker>;

  constructor(client: EEWBot) {
    this.client = client;
    this.api = axios.create({ baseURL: process.env.VOICEVOXAPI_URL, proxy: false });
    this.speakers = new Collection();

    if (!existsSync('dat/voices')) {
      mkdirSync('dat/voices');
    }
  }

  public get(guildId: string): Speaker | null {
    const speaker = this.speakers.get(guildId);
    if (!speaker) return null;
    return speaker;
  }

  public add(guildId: string, channelId: string, voiceAdapterCreator: DiscordGatewayAdapterCreator): void {
    if (this.get(guildId)) return;
    const player = createAudioPlayer();
    this.speakers.set(guildId, {
      guildId: guildId,
      channelId: channelId,
      connection: joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: voiceAdapterCreator,
      }),
      queue: [],
      player: createAudioPlayer(),
    });

    player.on(AudioPlayerStatus.Idle, () => {
      this.play(this.get(guildId) as Speaker);
    });
  }

  public leave(guildId: string): void {
    const speaker = this.get(guildId);
    if (!speaker) return;
    speaker.player.stop();
    speaker.connection.destroy();
    this.speakers.delete(guildId);
  }

  public shutdown(): void {
    this.speakers.forEach(speaker => {
      speaker.player.stop();
      speaker.connection.destroy();
      this.speakers.delete(speaker.guildId);
    });

    rmSync('dat/voices', { recursive: true });
  }

  public async notify(text: string, guildIds: Array<string>): Promise<void> {
    // どこでも読み上げやってないならリソース削減で
    if (this.speakers.size < 1) return;

    const audioQuery = await this.api.post(`audio_query?text=${encodeURI(text)}&speaker=2`);
    const synthesis = await this.api.post('synthesis?speaker=8', JSON.stringify(audioQuery.data), {
      responseType: 'arraybuffer',
      headers: {
        'accept': 'audio/wav',
        'Content-Type': 'application/json',
      },
    });

    const id = SnowflakeUtil.generate();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method
    writeFileSync(`dat/voices/${id}.wav`, Buffer.from(synthesis.data as Array<number>), 'binary');

    this.speakers.forEach(speaker => {
      if (!guildIds.includes(speaker.guildId)) return;
      speaker.queue.push(id);

      if (speaker.player.state.status === AudioPlayerStatus.Idle) {
        this.play(speaker);
      }
    });
  }

  private play(speaker: Speaker): void {
    if (speaker.queue.length < 1) return;

    const resource = createAudioResource(`dat/voices/${speaker.queue.shift() as string}.wav`);
    speaker.player.play(resource);
    speaker.connection.subscribe(speaker.player);
  }
}
