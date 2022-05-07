import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageEmbed, MessageAttachment } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
    public constructor() {
        super('quakeinfo',
            '最新の地震情報を表示する',
            'quakeinfo',
            [],
            'eew',
            new SlashCommandBuilder()
                .setName('quakeinfo')
                .setDescription('最新の地震情報を表示する'),
        );
    }

    public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        const quakeInfo = client.latestQuakeInfo;
        if (!quakeInfo) {
            await interaction.followUp('データがありません');
            return;
        }

        await interaction.followUp({
            embeds: [
                new MessageEmbed()
                    .setTitle('最新の地震情報')
                    .setDescription(`${quakeInfo.time}頃、${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました`)
                    .addField('最大震度', quakeInfo.intensity)
                    .addField('発生時刻', `${quakeInfo.time}頃`)
                    .addField('震源の深さ', quakeInfo.depth)
                    .addField('マグニチュード', quakeInfo.magnitude)
                    .addField('北緯', quakeInfo.latitudey.replace('北緯', ''))
                    .addField('東経', quakeInfo.longitude.replace('東経', ''))
                    .setTimestamp(),
            ],
        });

        await interaction.followUp({
            files: [
                new MessageAttachment(quakeInfo.detail),
                new MessageAttachment(quakeInfo.local),
                new MessageAttachment(quakeInfo.global),
            ],
        });

        for (const relative of quakeInfo.relatives) {
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`震度${relative.intensity}を観測した場所`)
                        .setDescription(relative.points.join('\n')),
                ],
            });
        }
    }
}