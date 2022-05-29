import { Client, Collection, Intents } from 'discord.js';
import { getLogger, configure, shutdown, Logger } from 'log4js';
import { Command } from './interfaces/Command';
import Database from './database/Database';
import { QuakeInfoData } from './interfaces/QuakeInfoData';
import VOICEVOXClient from './utils/VOICEVOXClient';
import Twitter from 'twitter';

export default class EEWBot extends Client {
  public readonly logger: Logger;
  public readonly commands: Collection<string, Command>;
  public readonly database: Database;
  public latestQuakeInfo: QuakeInfoData | null;
  public readonly voicevoxClient: VOICEVOXClient;
  public readonly twitter: Twitter;

  public constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
      ],
      allowedMentions: {
        parse: ['roles'],
        repliedUser: false,
      },
    });

    configure({
      appenders: {
        out: { type: 'stdout', layout: { type: 'coloured' } },
        app: { type: 'file', filename: 'logs/eewbot.log', pattern: 'yyyy-MM-dd.log' },
      },
      categories: {
        default: { appenders: ['out', 'app'], level: 'all' },
      },
    });

    this.logger = getLogger('EEWBot');
    this.commands = new Collection();
    this.database = new Database();
    this.latestQuakeInfo = null;
    this.voicevoxClient = new VOICEVOXClient(this);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.twitter = new Twitter({
      consumer_key: process.env.TWITTER_KET as string,
      consumer_secret: process.env.TWITTER_SECRET as string,
      access_token_key: process.env.TWITTER_ACCESS_TOKEN as string,
      access_token_secret: process.env.TWITTER_ACCESS_SECRET as string,
    });
  }

  public shutdown(): void {
    this.logger.info('シャットダウンしています...');
    this.voicevoxClient.shutdown();
    this.destroy();
    this.database.shutdown();
    shutdown();

    process.exit();
  }
}
