import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  public constructor() {
    super('monitor',
      '現在の強震モニタを表示する',
      'eew',
      new SlashCommandBuilder()
        .setName('monitor')
        .setDescription('現在の強震モニタを表示する'));
  }

  public async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
    await interaction.followUp({
      files: [
        'dat/nowMonitor.png',
      ],
    });
  }
}
