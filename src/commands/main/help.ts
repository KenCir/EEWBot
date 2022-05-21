import { codeBlock, SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, Message, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
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
    const commandName = interaction.options.getString('commandname', false);
    if (!commandName) {
      const embeds: Array<MessageEmbed> = [];
      embeds.push(
        new MessageEmbed()
          .setTitle(`${client.user?.tag as string} HELP`)
          .setDescription('このBotは緊急地震速報・地震情報をDiscordにテキスト&ボイスでお知らせするBotです。\n全ての情報の正確性は保証されません、自己責任でご利用ください。\n\n開発者: Ken_Cir#0514\n\n音声合成クレジット\nVOICEVOX:春日部つむぎ')
          .addField('メインコマンド', client.commands.filter(x => x.category == 'main').map((x) => '`' + x.name + '`').join(', '))
          .addField('EEWコマンド', client.commands.filter(x => x.category == 'eew').map((x) => '`' + x.name + '`').join(', '))
          .setColor('RANDOM'),
        new MessageEmbed()
          .setTitle('メインコマンド')
          .setDescription(codeBlock(client.commands.filter(x => x.category == 'main').map((x) => `/${x.name}: ${x.description}`).join('\n')))
          .setColor('RANDOM'),
        new MessageEmbed()
          .setTitle('EEWコマンド')
          .setDescription(codeBlock(client.commands.filter(x => x.category == 'eew').map((x) => `/${x.name}: ${x.description}`).join('\n')))
          .setColor('RANDOM'),
      );

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
      const command = client.commands.get(commandName);
      if (!command) {
        await interaction.followUp(`コマンド名: ${commandName}は存在しません`);
        return;
      }
      await interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle(`コマンド名: ${command.name}の詳細`)
            .setDescription(`コマンド名: ${command.name}\n説明: ${command.description}\n使用法: ${codeBlock(`/${command.name}`)}\nコマンドカテゴリ: ${command.category}`)
            .setColor('RANDOM'),
        ],
      });
    }
  }
}
