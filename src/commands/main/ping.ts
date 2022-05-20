import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('ping',
      'BotのPing値とメモリ使用率を表示',
      'main',
      new SlashCommandBuilder()
        .setName('ping')
        .setDescription('BotのPing値とメモリ使用率を表示'));
  }

  public async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
    const msg: Message = await interaction.followUp('Pong!') as Message;
    await interaction.editReply(`APIPing: ${msg.createdTimestamp - interaction.createdTimestamp}ms\nWebSocketPing: ${client.ws.ping}ms\nメモリ使用率: ${Math.round(process.memoryUsage().rss / 1024 / 1024 * 100) / 100}MB`);
  }
}
