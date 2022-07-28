/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, Message, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ComponentType, CommandInteractionOptionResolver } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';

export default class extends Command {
  constructor() {
    super('help',
      '全コマンドを表示する',
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
    const commandName = (interaction.options as CommandInteractionOptionResolver).getString('commandname', false);
    if (!commandName) {
      const embeds: Array<EmbedBuilder> = [];
      embeds.push(
        new EmbedBuilder()
          .setTitle(`${client.user?.tag as string} HELP`)
          .setDescription('このBotは緊急地震速報・地震情報をDiscordにテキスト&ボイスでお知らせするBotです。\n全ての情報の正確性は保証されません、自己責任でご利用ください。\n\n開発者: Ken_Cir#0514\n\n音声合成クレジット\nVOICEVOX:四国めたん')
          .addFields([
            { name: 'メインコマンド', value: client.commands.filter(x => x.category == 'main').map((x) => '`' + x.name + '`').join(', ') },
            { name: 'EEWコマンド', value: client.commands.filter(x => x.category == 'eew').map((x) => '`' + x.name + '`').join(', ') },
            { name: 'VC読み上げコマンド', value: client.commands.filter(x => x.category == 'voice').map((x) => '`' + x.name + '`').join(', ') },
          ]),

        new EmbedBuilder()
          .setTitle('メインコマンド')
          .setDescription(codeBlock(client.commands.filter(x => x.category == 'main').map((x) => `/${x.name}: ${x.description}`).join('\n'))),

        new EmbedBuilder()
          .setTitle('EEWコマンド')
          .setDescription(codeBlock(client.commands.filter(x => x.category == 'eew').map((x) => `/${x.name}: ${x.description}`).join('\n'))),

        new EmbedBuilder()
          .setTitle('VC読み上げコマンド')
          .setDescription(codeBlock(client.commands.filter(x => x.category == 'voice').map((x) => `/${x.name}: ${x.description}`).join('\n'))),
      );


      let select = 0;
      const buttons = (new ActionRowBuilder()
        .addComponents(
          [
            new ButtonBuilder()
              .setCustomId('left')
              .setLabel('◀️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(),
            new ButtonBuilder()
              .setCustomId('right')
              .setLabel('▶️')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('stop')
              .setLabel('⏹️')
              .setStyle(ButtonStyle.Primary),
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ) as any);

      const msg: Message = await interaction.followUp(
        {
          embeds: [embeds[0]],
          components: [buttons],
        },
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      const filter = (i: any) => i.user.id === interaction.user.id;
      const collector = msg.createMessageComponentCollector({ filter: filter, componentType: ComponentType.Button });
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
      const command = client.commands.get(commandName);
      if (!command) {
        await interaction.followUp(`コマンド名: ${commandName}は存在しません`);
        return;
      }
      await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle(`コマンド名: ${command.name}の詳細`)
            .setDescription(`コマンド名: ${command.name}\n説明: ${command.description}\n使用法: ${codeBlock(`/${command.name}`)}\nコマンドカテゴリ: ${command.category}`),
        ],
      });
    }
  }
}
