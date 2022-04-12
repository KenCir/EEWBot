import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageEmbed, MessageActionRow, MessageButton, Message, MessageComponentInteraction, MessageSelectMenu } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';
import { intensityStringToNumber, intensityNumberToString } from '../../utils/IntensityUtil';

export default class extends Command {
    public constructor() {
        super('setup',
            '地震通知などのセットアップ',
            'setup (eew|quakeinfo)',
            [],
            'eew',
            (new SlashCommandBuilder()
                .setName('setup')
                .setDescription('地震通知などのセットアップ')
                .addSubcommand(subCommand => {
                    return subCommand
                        .setName('eew')
                        .setDescription('緊急地震速報通知のセットアップ');
                })
                .addSubcommand(subCommand => {
                    return subCommand
                        .setName('quakeinfo')
                        .setDescription('地震通知のセットアップ');
                }) as SlashCommandBuilder),
        );
    }

    public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        if (interaction.options.getSubcommand() === 'eew') {
            const setupMsg: Message = await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle('緊急地震速報通知のセットアップ')
                        .setDescription('緊急地震速報通知のセットアップを行います、よろしいですか？')
                        .setFooter({ text: '60秒以内に選択してください' })
                        .setColor('RANDOM'),
                ],
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
            const setupFilter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
            const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: setupFilter });
            if (responseSetup.customId === 'no') {
                await interaction.editReply({
                    content: '緊急地震速報通知セットアップをキャンセルしました',
                    embeds: [],
                    components: [],
                });
                return;
            }

            const intensityMsg: Message = await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle('緊急地震速報通知のセットアップ')
                        .setDescription('通知する最小震度を選択してください')
                        .setFooter({ text: '60秒以内に選択してください' })
                        .setColor('RANDOM'),
                ],
                components: [
                    new MessageActionRow()
                        .addComponents(
                            new MessageSelectMenu()
                                .setCustomId('intensitySelect')
                                .setOptions([
                                    {
                                        label: '震度1',
                                        value: '1',
                                    },
                                    {
                                        label: '震度2',
                                        value: '2',
                                    },
                                    {
                                        label: '震度3',
                                        value: '3',
                                    },
                                    {
                                        label: '震度4',
                                        value: '4',
                                    },
                                    {
                                        label: '震度5弱',
                                        value: '5弱',
                                    },
                                    {
                                        label: '震度5強',
                                        value: '5強',
                                    },
                                    {
                                        label: '震度6弱',
                                        value: '6弱',
                                    },
                                    {
                                        label: '震度6強',
                                        value: '6強',
                                    },
                                    {
                                        label: '震度7',
                                        value: '7',
                                    },
                                ]),
                        ),
                ],
            }) as Message;
            const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
            const responseIntensity = await intensityMsg.awaitMessageComponent({ time: 60000, componentType: 'SELECT_MENU', filter: intensityFilter });
            const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);
            client.database.addEEWChannel(interaction.channelId, intensity, []);
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle('緊急地震速報通知セットアップ完了')
                        .setDescription('緊急地震速報通知セットアップが完了しました')
                        .addField('通知最小震度', intensityNumberToString(intensity))
                        .addField('通知時にメンションするロール', 'なし')
                        .setColor('RANDOM'),
                ],
            });
        }
        // eslint-disable-next-line no-empty
        else if (interaction.options.getSubcommand() === 'quakeinfo') {
        }
    }

    // eslint-disable-next-line no-empty-function, @typescript-eslint/no-empty-function
    public async run_message(client: EEWBot, message: Message<boolean>, args: string[]): Promise<void> {
    }
}