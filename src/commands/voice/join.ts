import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { CommandInteraction, CacheType, GuildMember, Guild } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
    public constructor() {
        super('join',
            'VCに参加して地震速報等の読み上げを開始する',
            'join',
            [],
            'voice',
            new SlashCommandBuilder()
                .setName('join')
                .setDescription('VCに参加して地震速報等の読み上げを開始する'),
        );
    }

    public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        if (client.voicevoxClient.get(interaction.guildId as string)) {
            await interaction.followUp('既にVC参加済みです');
            return;
        }
        else if (!(interaction.member as GuildMember).voice.channelId) {
            await interaction.followUp('VCに参加してからこのコマンドを使用してください');
            return;
        }

        client.voicevoxClient.add(interaction.guildId as string, (interaction.member as GuildMember).voice.channelId as string, (interaction.guild as Guild).voiceAdapterCreator as DiscordGatewayAdapterCreator);
        await interaction.followUp('VCに参加しました');
    }
}