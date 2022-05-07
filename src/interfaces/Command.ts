import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import EEWBot from '../EEWBot';

export abstract class Command {
    /**
     * コマンド名
     */
    public readonly name: string;

    /**
     * コマンドの説明
     */
    public readonly description: string;

    /**
     * コマンドの使用法(引数など)
     */
    public readonly usage: string;

    /**
     * コマンドエイリアス
     */
    public readonly aliases: Array<string>;

    /**
     * コマンドカテゴリ
     */
    public readonly category: string;

    public readonly commandData: SlashCommandBuilder;

    public constructor(name: string, description: string, usage: string, aliases: Array<string>, category: string, commandData: SlashCommandBuilder) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.aliases = aliases;
        this.category = category;
        this.commandData = commandData;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, no-empty-function
    async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
    }
}