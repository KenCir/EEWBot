import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
    constructor() {
        super('help',
            '全コマンドを表示する',
            '(コマンド名)',
            [],
            'main',
            (new SlashCommandBuilder()
                .setName('help')
                .setDescription('全コマンドを表示する')
                .addStringOption(option => {
                    return option
                        .setName('commandname')
                        .setDescription('コマンド名')
                        .setRequired(false);
                }) as SlashCommandBuilder),
        );
    }

    async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
        const commandName = interaction.options.getString('commandname', false);
        if (!commandName) {
            const embeds: Array<MessageEmbed> = [];
            embeds.push(
                new MessageEmbed()
                    .setTitle(`${client.user?.tag as string} HELP`)
                    .addField('メインコマンド', client.commands.filter(x => x.category == 'main').map((x) => '`' + x.name + '`').join(', '))
                    .setColor('RANDOM'),
                new MessageEmbed()
                    .setTitle('メインコマンド')
                    .setDescription(codeBlock(client.commands.filter(x => x.category == 'main').map((x) => `${process.env.PREFIX as string}${x.name} ${x.usage}: ${x.description}`).join('\n')))
                    .setColor('RANDOM'),
            );
            /*
            if (message.author.id === process.env.OWNERID) {
                embeds.push(
                    new MessageEmbed()
                        .setTitle('Bot管理者コマンド')
                        .setDescription(codeBlock(client.commands.filter(x => x.category == 'owner').map((x) => `${process.env.PREFIX}${x.name} ${x.usage}: ${x.description}`).join('\n')))
                        .setColor('RANDOM'),
                );
            }
            */

            let select = 0;
            const buttons = new MessageActionRow()
                .addComponents(
                    [
                        new MessageButton()
                            .setCustomId('left')
                            .setLabel('◀️')
                            .setStyle('PRIMARY')
                            .setDisabled(),
                        new MessageButton()
                            .setCustomId('right')
                            .setLabel('▶️')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('stop')
                            .setLabel('⏹️')
                            .setStyle('DANGER'),
                    ],
                );

            const msg: Message = await interaction.followUp(
                {
                    embeds: [embeds[0]],
                    components: [buttons],
                },
            ) as Message;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            const filter = (i: any) => i.user.id === interaction.user.id;
            const collector = msg.createMessageComponentCollector({ filter: filter, componentType: 'BUTTON' });
            collector.on('collect', async i => {
                if (i.customId === 'left') {
                    select--;
                    buttons.components[1].setDisabled(false);
                    if (select < 1) {
                        buttons.components[0].setDisabled();
                    }
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [buttons],
                        },
                    );
                }
                else if (i.customId === 'right') {
                    select++;
                    buttons.components[0].setDisabled(false);
                    if (select >= embeds.length - 1) {
                        buttons.components[1].setDisabled();
                    }
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [buttons],
                        },
                    );
                }
                else if (i.customId === 'stop') {
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [],
                        },
                    );
                    collector.stop();
                }
            });
        }
        else {
            const command = client.commands.get(commandName) || client.commands.find(c => c.aliases.includes(commandName));
            if (!command) {
                await interaction.followUp(`コマンド名: ${commandName}は存在しません`);
                return;
            }
            await interaction.followUp({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`コマンド名: ${command.name}の詳細`)
                        .setDescription(`コマンド名: ${command.name}\n説明: ${command.description}\n使用法: ${codeBlock(`${process.env.PREFIX as string}${command.name} ${command.usage}\n`)}\nエイリアス: ${codeBlock(command.aliases.join('\n'))}\nコマンドカテゴリ: ${command.category}`)
                        .setColor('RANDOM'),
                ],
            });
        }
    }

    async run_message(client: EEWBot, message: Message<boolean>, args: string[]): Promise<void> {
        if (!args[0]) {
            const embeds: Array<MessageEmbed> = [];
            embeds.push(
                new MessageEmbed()
                    .setTitle(`${client.user?.tag as string} HELP`)
                    .addField('メインコマンド', client.commands.filter(x => x.category == 'main').map((x) => '`' + x.name + '`').join(', '))
                    .setColor('RANDOM'),
                new MessageEmbed()
                    .setTitle('メインコマンド')
                    .setDescription(codeBlock(client.commands.filter(x => x.category == 'main').map((x) => `${process.env.PREFIX as string}${x.name} ${x.usage}: ${x.description}`).join('\n')))
                    .setColor('RANDOM'),
            );
            /*
            if (message.author.id === process.env.OWNERID) {
                embeds.push(
                    new MessageEmbed()
                        .setTitle('Bot管理者コマンド')
                        .setDescription(codeBlock(client.commands.filter(x => x.category == 'owner').map((x) => `${process.env.PREFIX}${x.name} ${x.usage}: ${x.description}`).join('\n')))
                        .setColor('RANDOM'),
                );
            }
            */

            let select = 0;
            const buttons = new MessageActionRow()
                .addComponents(
                    [
                        new MessageButton()
                            .setCustomId('left')
                            .setLabel('◀️')
                            .setStyle('PRIMARY')
                            .setDisabled(),
                        new MessageButton()
                            .setCustomId('right')
                            .setLabel('▶️')
                            .setStyle('PRIMARY'),
                        new MessageButton()
                            .setCustomId('stop')
                            .setLabel('⏹️')
                            .setStyle('DANGER'),
                    ],
                );

            const msg: Message = await message.reply(
                {
                    embeds: [embeds[0]],
                    components: [buttons],
                },
            );
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
            const filter = (i: any) => i.user.id === message.author.id;
            const collector = msg.createMessageComponentCollector({ filter: filter, componentType: 'BUTTON' });
            collector.on('collect', async i => {
                if (i.customId === 'left') {
                    select--;
                    buttons.components[1].setDisabled(false);
                    if (select < 1) {
                        buttons.components[0].setDisabled();
                    }
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [buttons],
                        },
                    );
                }
                else if (i.customId === 'right') {
                    select++;
                    buttons.components[0].setDisabled(false);
                    if (select >= embeds.length - 1) {
                        buttons.components[1].setDisabled();
                    }
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [buttons],
                        },
                    );
                }
                else if (i.customId === 'stop') {
                    await i.update(
                        {
                            embeds: [embeds[select]],
                            components: [],
                        },
                    );
                    collector.stop();
                }
            });
        }
        else {
            const command = client.commands.get(args[0]) || client.commands.find(c => c.aliases.includes(args[0]));
            if (!command) {
                await message.reply(`コマンド名: ${args[0]}は存在しません`);
                return;
            }
            await message.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`コマンド名: ${command.name}の詳細`)
                        .setDescription(`コマンド名: ${command.name}\n説明: ${command.description}\n使用法: ${codeBlock(`${process.env.PREFIX as string}${command.name} ${command.usage}\n`)}\nエイリアス: ${codeBlock(command.aliases.join('\n'))}\nコマンドカテゴリ: ${command.category}`)
                        .setColor('RANDOM'),
                ],
            });
        }
    }
}