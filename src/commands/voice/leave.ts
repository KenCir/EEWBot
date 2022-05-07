import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
    public constructor() {
        super('leave',
            'VCから退出する',
            'leave',
            [],
            'voice',
            new SlashCommandBuilder()
                .setName('leave')
                .setDescription('VCから退出する'),
        );
    }

    public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        if (!client.voicevoxClient.get(interaction.guildId as string)) {
            await interaction.followUp('VCに参加してません');
            return;
        }

        client.voicevoxClient.leave(interaction.guildId as string);
        await interaction.followUp('VCから退出しました');
    }
}