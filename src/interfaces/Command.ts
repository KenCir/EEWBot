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
   * コマンドカテゴリ
   */
  public readonly category: string;

  public readonly commandData: SlashCommandBuilder;

  public constructor(name: string, description: string, category: string, commandData: SlashCommandBuilder) {
    this.name = name;
    this.description = description;
    this.category = category;
    this.commandData = commandData;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function, no-empty-function
  async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
  }
}
