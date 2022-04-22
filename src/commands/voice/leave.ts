import { SlashCommandBuilder } from '@discordjs/builders';
import { DiscordGatewayAdapterCreator } from '@discordjs/voice';
import { Message } from 'discord.js';
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

    public async run_message(client: EEWBot, message: Message<boolean>, args: string[]): Promise<void> {
        if (!client.voicevoxClient.get(message.guildId as string)) {
            await message.reply('VCに参加してません');
            return;
        }

        client.voicevoxClient.leave(message.guildId as string);
        await message.reply('VCから退出しました');
    }
}