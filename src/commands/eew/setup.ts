import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, MessageEmbed, MessageActionRow, MessageButton, Message, MessageComponentInteraction, MessageSelectMenu, GuildMember } from 'discord.js';
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
        }) as SlashCommandBuilder),
    );
  }

  public async run(client: EEWBot, interaction: CommandInteraction<CacheType>): Promise<void> {
    if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR') && !(interaction.member as GuildMember).permissions.has('MANAGE_CHANNELS')) {
      await interaction.followUp('このコマンドは管理者権限かチャンネルを管理権限を持っている人のみ使用可能です');
      return;
    }

    // 緊急地震速報のSETUP
    if (interaction.options.getSubcommand() === 'eew') {
      if (client.database.getEEWChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは既に登録済みです');
        return;
      }

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
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
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
      });
      const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
      const responseIntensity = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'SELECT_MENU', filter: intensityFilter });
      const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);

      await responseIntensity.update({
        embeds: [
          new MessageEmbed()
            .setTitle('緊急地震速報通知のセットアップ')
            .setDescription('M3.5以上が予想される緊急地震速報を通知しますか？')
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
      });
      const responseMagnitude = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      let magnitude = 0;
      if (responseMagnitude.customId === 'ok') {
        magnitude = 1;
      }
      else if (responseMagnitude.customId === 'no') {
        magnitude = 0;
      }

      client.database.addEEWChannel(interaction.channelId, intensity, [], magnitude);
      await responseMagnitude.update({
        embeds: [
          new MessageEmbed()
            .setTitle('緊急地震速報通知セットアップ完了')
            .setDescription('緊急地震速報通知セットアップが完了しました')
            .addField('通知最小震度', intensityNumberToString(intensity))
            .addField('M3.5以上', magnitude === 0 ? '通知しない' : '通知する')
            .setColor('RANDOM'),
        ],
        components: [],
      });
    }
    else if (interaction.options.getSubcommand() === 'quakeinfo') {
      if (client.database.getQuakeInfoChannel(interaction.channelId)) {
        await interaction.followUp('このチャンネルは既に登録済みです');
        return;
      }

      const setupMsg: Message = await interaction.followUp({
        embeds: [
          new MessageEmbed()
            .setTitle('地震通知のセットアップ')
            .setDescription('地震通知のセットアップを行います、よろしいですか？')
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
      const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
      const responseSetup = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
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
          new MessageEmbed()
            .setTitle('地震通知のセットアップ')
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
      });
      const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
      const responseIntensity = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'SELECT_MENU', filter: intensityFilter });
      const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);

      await responseIntensity.update({
        embeds: [
          new MessageEmbed()
            .setTitle('地震通知のセットアップ')
            .setDescription('M3.5以上が予想される緊急地震速報を通知しますか？')
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
      });
      const responseMagnitude = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      let magnitude = 0;
      if (responseMagnitude.customId === 'ok') {
        magnitude = 1;
      }
      else if (responseMagnitude.customId === 'no') {
        magnitude = 0;
      }

      await responseMagnitude.update({
        embeds: [
          new MessageEmbed()
            .setTitle('地震通知のセットアップ')
            .setDescription('通知時に震度マップを送信しますか？')
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
      });
      const responseImage = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      let image = 0;
      if (responseImage.customId === 'ok') image = 1;
      else if (responseImage.customId === 'no') image = 0;

      await responseImage.update({
        embeds: [
          new MessageEmbed()
            .setTitle('地震通知のセットアップ')
            .setDescription('通知時に各地の震度情報を送信しますか？')
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
      });
      const responseRelative = await setupMsg.awaitMessageComponent({ time: 60000, componentType: 'BUTTON', filter: filter });
      let relative = 0;
      if (responseRelative.customId === 'ok') relative = 1;
      else if (responseRelative.customId === 'no') relative = 0;

      client.database.addQuakeInfoChannel(interaction.channelId, intensity, magnitude, [], image, relative);
      await responseRelative.update({
        embeds: [
          new MessageEmbed()
            .setTitle('地震通知セットアップ完了')
            .setDescription('地震通知セットアップが完了しました')
            .addField('通知最小震度', intensityNumberToString(intensity))
            .addField('M3.5以上', magnitude === 0 ? '通知しない' : '通知する')
            .addField('通知時に震度マップを送信', image === 0 ? 'しない' : 'する')
            .addField('通知時に各地の震度情報を送信', relative === 0 ? 'しない' : 'する'),
        ],
        components: [],
      });
    }
  }
}
