import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { Message } from 'discord.js';
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

    public async run_message(client: EEWBot, message: Message<boolean>, args: string[]): Promise<void> {
        if (client.voicevoxClient.get(message.guildId as string)) {
            await message.reply('既にVC参加済みです');
            return;
        }
        else if (!message.member?.voice.channelId) {
            await message.reply('VCに参加してからこのコマンドを使用してください');
            return;
        }

        client.voicevoxClient.add(message.guildId as string, message.member.voice.channelId, message.guild?.voiceAdapterCreator as DiscordGatewayAdapterCreator);
        await message.reply('VCに参加しました');
    }
}