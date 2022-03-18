import { Client, Collection, Intents } from 'discord.js';
import { getLogger, configure, shutdown, Logger } from 'log4js';
import { Command } from './interfaces/Command';

export default class EEWBot extends Client {
    public readonly logger: Logger;
    public readonly commands: Collection<string, Command>;

    public constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MESSAGES,
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
    }

    public shutdown(): void {
        this.destroy();
        shutdown();
    }
}