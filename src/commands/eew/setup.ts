import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, Message, MessageComponentInteraction, SelectMenuBuilder, GuildMember, CommandInteractionOptionResolver, PermissionFlagsBits, ButtonStyle, ComponentType } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';
import { intensityStringToNumber, intensityNumberToString } from '../../utils/IntensityUtil';

export default class extends Command {
  public constructor() {
    super('setup',
      '地震通知などのセットアップ',
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
        })
        .addSubcommand(subCommand => {
          return subCommand
            .setName('tunami')
            .setDescription('津波予報通知のセットアップ');
        }) as SlashCommandBuilder),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) && !(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.followUp('このコマンドは管理者権限かチャンネルを管理権限を持っている人のみ使用可能です');
      return;
    }

    // 緊急地震速報のSETUP
    if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'eew') {
      if (client.database.getEEWChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは既に登録済みです');
        return;
      }

      const setupMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('緊急地震速報通知のセットアップ')
            .setDescription('緊急地震速報通知のセットアップを行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
      if (responseSetup.customId === 'no') {
        await responseSetup.update({
          content: '緊急地震速報通知セットアップをキャンセルしました',
          embeds: [],
          components: [],
        });
        return;
      }

      await responseSetup.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('緊急地震速報通知のセットアップ')
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
      const responseIntensity = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
      const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);

      client.database.addEEWChannel(interaction.channelId, intensity, []);
      await responseIntensity.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('緊急地震速報通知セットアップ完了')
            .setDescription('緊急地震速報通知セットアップが完了しました')
            .addFields([
              { name: '通知最小震度', value: intensityNumberToString(intensity) },
            ]),

        ],
        components: [],
      });
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'quakeinfo') {
      if (client.database.getQuakeInfoChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは既に登録済みです');
        return;
      }

      const setupMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知のセットアップ')
            .setDescription('地震通知のセットアップを行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
      if (responseSetup.customId === 'no') {
        await responseSetup.update({
          content: '地震通知セットアップをキャンセルしました',
          embeds: [],
          components: [],
        });
        return;
      }

      await responseSetup.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知のセットアップ')
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
      const responseIntensity = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
      const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);

      await responseIntensity.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知のセットアップ')
            .setDescription('通知時に震度マップを送信しますか？')
            .setFooter({ text: '60秒以内に選択してください' }),

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const responseImage = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
      let image = 0;
      if (responseImage.customId === 'ok') image = 1;
      else if (responseImage.customId === 'no') image = 0;

      await responseImage.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知のセットアップ')
            .setDescription('通知時に各地の震度情報を送信しますか？')
            .setFooter({ text: '60秒以内に選択してください' }),

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const responseRelative = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
      let relative = 0;
      if (responseRelative.customId === 'ok') relative = 1;
      else if (responseRelative.customId === 'no') relative = 0;

      client.database.addQuakeInfoChannel(interaction.channelId, intensity, [], image, relative);
      await responseRelative.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('地震通知セットアップ完了')
            .setDescription('地震通知セットアップが完了しました')
            .addFields([
              { name: '通知最小震度', value: intensityNumberToString(intensity) },
              { name: '通知時に震度マップを送信', value: image === 0 ? 'しない' : 'する' },
              { name: '通知時に各地の震度情報を送信', value: relative === 0 ? 'しない' : 'する' },
            ]),
        ],
        components: [],
      });
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'tunami') {
      if (client.database.getTunamiChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは既に登録済みです');
        return;
      }

      const setupMsg: Message = await interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setTitle('津波予報通知のセットアップ')
            .setDescription('津波予報通知のセットアップを行います、よろしいですか？')
            .setFooter({ text: '60秒以内に選択してください' }),

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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any,
        ],
      });
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.Button, filter: filter });
      if (responseSetup.customId === 'no') {
        await responseSetup.update({
          content: '津波予報通知セットアップをキャンセルしました',
          embeds: [],
          components: [],
        });
        return;
      }

      client.database.addTunamiChannel(interaction.channelId);
      await responseSetup.update({
        embeds: [
          new EmbedBuilder()
            .setTitle('津波予報通知セットアップ完了')
            .setDescription('津波予報通知セットアップが完了しました'),
        ],
        components: [],
      });
    }
  }
}
