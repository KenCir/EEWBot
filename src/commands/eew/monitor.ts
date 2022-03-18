import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Message } from 'discord.js';
import EEWBot from '../../EEWBot';
import EEWMonitor from '../../functions/EEWMonitor';
import { Command } from '../../interfaces/Command';

export default class extends Command {
    public constructor() {
        super('monitor',
            '現在の強震モニタを表示する',
            'monitor',
            [],
            'eew',
            new SlashCommandBuilder()
                .setName('monitor')
                .setDescription('現在の強震モニタを表示する'));
    }

    public async run(client: EEWBot, interaction: CommandInteraction): Promise<void> {
        await EEWMonitor();
        await interaction.followUp({
            files: [
                'dat/nowMonitor.png',
            ],
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async run_message(client: EEWBot, message: Message, args: string[]): Promise<void> {
        try {
            await EEWMonitor();
        }
        // eslint-disable-next-line no-empty
        catch (e) { }
        await message.reply({
            files: [
                'dat/nowMonitor.png',
            ],
        });
    }
}