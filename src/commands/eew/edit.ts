/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, ActionRowBuilder, ButtonBuilder, Message, MessageComponentInteraction, EmbedBuilder, SelectMenuBuilder, GuildMember, PermissionFlagsBits, CommandInteractionOptionResolver, ComponentType, ButtonStyle } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';
import { intensityNumberToString, intensityStringToNumber } from '../../utils/IntensityUtil';

export default class extends Command {
  constructor() {
    super('edit',
      '通知設定の編集をする',
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
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) && !(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.followUp('このコマンドは管理者権限かチャンネルを管理権限を持っている人のみ使用可能です');
      return;
    }

    if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'eew') {
      const eewNotifyData = client.database.getEEWChannel(interaction.channelId);
      if (!eewNotifyData) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      const editMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('設定を編集する項目を選択してください')
            .addFields([
              { name: '設定項目名', value: '現在の設定' },
              { name: '最小地震', value: intensityNumberToString(eewNotifyData.min_intensity) },
            ]),
        ],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new SelectMenuBuilder()
                .setCustomId('editSelect')
                .setOptions([
                  {
                    label: '最小震度',
                    value: 'intensity',
                  },
                ]),
            ) as any,
        ],
      });
      const editFilter = (i: MessageComponentInteraction) => (i.customId === 'editSelect') && i.user.id === interaction.user.id;
      const responseEdit = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: editFilter });
      if (responseEdit.values[0] === 'intensity') {
        await responseEdit.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('緊急地震速報通知の編集')
              .setDescription('通知する最小震度を選択してください')
              .setFooter({ text: '60秒以内に選択してください' }),

          ],
          components: [
            new ActionRowBuilder()
              .addComponents(
                new SelectMenuBuilder()
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
              ) as any,
          ],
        });
        const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
        const responseIntensity = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
        const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);
        client.database.editEEWChannel(eewNotifyData.channel_id, intensity, eewNotifyData.mention_roles);
        await responseIntensity.update({
          content: `最小通知震度を${intensityNumberToString(intensity)}に変更しました`,
          embeds: [],
          components: [],
        });
      }
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'quakeinfo') {
      const quakeInfoNotifyData = client.database.getQuakeInfoChannel(interaction.channelId);
      if (!quakeInfoNotifyData) {
        await interaction.followUp('このチャンネルは登録されていません');
        return;
      }

      const editMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('設定を編集する項目を選択してください')
            .addFields([
              { name: '設定項目名', value: '現在の設定' },
              { name: '最小震度', value: intensityNumberToString(quakeInfoNotifyData.min_intensity) },
              { name: '通知時に震度マップを送信', value: quakeInfoNotifyData.image === 0 ? 'しない' : 'する' },
              { name: '通知時に各地の震度情報を送信', value: quakeInfoNotifyData.relative === 0 ? 'しない' : 'する' },
            ]),
        ],
        components: [
          new ActionRowBuilder()
            .addComponents(
              new SelectMenuBuilder()
                .setCustomId('editSelect')
                .setOptions([
                  {
                    label: '最小震度',
                    value: '最小震度',
                  },
                  {
                    label: '通知時に震度マップを送信',
                    value: '通知時に震度マップを送信',
                  },
                  {
                    label: '通知時に各地の震度情報を送信',
                    value: '通知時に各地の震度情報を送信',
                  },
                ]),
            ) as any,
        ],
      });
      const editFilter = (i: MessageComponentInteraction) => (i.customId === 'editSelect') && i.user.id === interaction.user.id;
      const responseEdit = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: editFilter });
      if (responseEdit.values[0] === '最小震度') {
        await responseEdit.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('地震通知の編集')
              .setDescription('通知する最小震度を選択してください')
              .setFooter({ text: '60秒以内に選択してください' }),
          ],
          components: [
            new ActionRowBuilder()
              .addComponents(
                new SelectMenuBuilder()
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
              ) as any,
          ],
        });
        const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
        const responseIntensity = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
        const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);
        client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, intensity, quakeInfoNotifyData.mention_roles, quakeInfoNotifyData.image, quakeInfoNotifyData.relative);
        await responseIntensity.update({
          content: `最小通知震度を${intensityNumberToString(intensity)}に変更しました`,
          embeds: [],
          components: [],
        });
      }
      else if (responseEdit.values[0] === '通知時に震度マップを送信') {
        await responseEdit.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('地震通知の編集')
              .setDescription('通知時に震度マップを送信しますか？'),
          ],
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('ok')
                  .setEmoji('✅')
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId('no')
                  .setEmoji('❌')
                  .setStyle(ButtonStyle.Primary),
              ) as any,
          ],
        });

        const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
        const responseImage = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
        if (responseImage.customId === 'ok') {
          client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, 1, quakeInfoNotifyData.relative);
          await responseImage.update({
            content: '通知時に震度マップを送信するに変更しました',
            embeds: [],
            components: [],
          });
        }
        else if (responseImage.customId === 'no') {
          client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, 0, quakeInfoNotifyData.relative);
          await responseImage.update({
            content: '通知時に震度マップを送信しないに変更しました',
            embeds: [],
            components: [],
          });
        }
      }
      else if (responseEdit.values[0] === '通知時に各地の震度情報を送信') {
        await responseEdit.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('地震通知の編集')
              .setDescription('通知時に各地の震度情報を送信しますか？'),
          ],
          components: [
            new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('ok')
                  .setEmoji('✅')
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId('no')
                  .setEmoji('❌')
                  .setStyle(ButtonStyle.Primary),
              ) as any,
          ],
        });

        const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
        const responseRelative = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
        if (responseRelative.customId === 'ok') {
          client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, quakeInfoNotifyData.image, 1);
          await responseRelative.update({
            content: '通知時に各地の震度情報を送信するに変更しました',
            embeds: [],
            components: [],
          });
        }
        else if (responseRelative.customId === 'no') {
          client.database.editQuakeInfoChannel(quakeInfoNotifyData.channel_id, quakeInfoNotifyData.min_intensity, quakeInfoNotifyData.mention_roles, quakeInfoNotifyData.image, 0);
          await responseRelative.update({
            content: '通知時に各地の震度情報を送信しないに変更しました',
            embeds: [],
            components: [],
          });
        }
      }
    }
  }
}
