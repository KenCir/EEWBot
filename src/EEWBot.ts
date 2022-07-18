import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { getLogger, configure, shutdown, Logger } from 'log4js';
import { Command } from './interfaces/Command';
import Database from './database/Database';
import { QuakeInfoData } from './interfaces/QuakeInfoData';
import VOICEVOXClient from './utils/VOICEVOXClient';

export default class EEWBot extends Client {
  public readonly logger: Logger;
  public readonly commands: Collection<string, Command>;
  public readonly database: Database;
  public latestQuakeInfo: QuakeInfoData | null;
  public readonly voicevoxClient: VOICEVOXClient;

  public constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildVoiceStates,
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
