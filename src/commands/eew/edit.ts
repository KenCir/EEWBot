import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageActionRow, MessageButton, Message, MessageComponentInteraction, MessageEmbed, MessageSelectMenu } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';
import { intensityNumberToString } from '../../utils/IntensityUtil';

export default class extends Command {
    constructor() {
        super('edit',
            '通知設定の編集をする',
            'edit (eew|quakeinfo)',
            [],
            'eew',
            (new SlashCommandBuilder()
                .setName('edit')
                .setDescription('通知設定の編集をする')
                .addSubcommand(subCommand => {
                    return subCommand
                        .setName('eew')
                        .setDescription('緊急地震速報通知の編集');
                })
                .addSubcommand(subCommand => {
                    return subCommand
                        .setName('quakeinfo')
                        .setDescription('地震通知の編集');
                }) as SlashCommandBuilder),
        );
    }

    public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        if (interaction.options.getSubcommand() === 'eew') {
            const eewNotifyData = client.database.getEEWChannel(interaction.channelId);
            if (!eewNotifyData) {
                const msg: Message = await interaction.followUp({
                    content: 'このチャンネルには緊急地震速報通知がセットアップされていないようです、セットアップを実行しますか？',
                    components: [
                        new MessageActionRow()
                            .addComponents(
                                new MessageButton()
                                    .setCustomId('ok')
                                    .setEmoji('✅')
                                    .setStyle('PRIMARY'),
                                new MessageButton()
                                    .setCustomId('no')
                                    .setEmoji('❌')
                                    .setStyle('PRIMARY'),
                            ),
                    ],
                }) as Message;

                const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
                const response = await msg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
                if (response.customId === 'no') {
                    await response.update({
                        content: 'セットアップをキャンセルしました',
                        components: [],
                    });
                }
                else if (response.customId === 'ok') {
                    await response.update({
                        content: 'セットアップを開始しています...',
                        components: [],
                    });
                    await client.commands.get('setup')?.run(client, interaction);
                }

                return;
            }

            const msg: Message = await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle('設定を編集する項目を選択してください')
                        .addField('設定項目名', '現在の設定')
                        .addField('最小地震', intensityNumberToString(eewNotifyData.min_intensity))
                        .addField('~~通知時にメンションするロール~~', 'なし'),
                ],
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('edit_select')
                                .setOptions([
                                    {
                                        label: '最小震度',
                                        value: '最小震度',
                                    },
                                ]),
                        ),
                ],
            }) as Message;
        }
    }
}