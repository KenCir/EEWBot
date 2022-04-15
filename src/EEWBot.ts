import { Client, Collection, Intents } from 'discord.js';
import { getLogger, configure, shutdown, Logger } from 'log4js';
import { Command } from './interfaces/Command';
import Database from './database/Database';
import { QuakeInfoData } from './interfaces/QuakeInfoData';

export default class EEWBot extends Client {
    public readonly logger: Logger;
    public readonly commands: Collection<string, Command>;
    public readonly database: Database;
    public latestQuakeInfo: QuakeInfoData | null;

    public constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_INTEGRATIONS,
            ],
            allowedMentions: {
                parse: [],
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
    }

    public shutdown(): void {
        this.destroy();
        shutdown();
    }
}