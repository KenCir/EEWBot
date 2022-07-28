import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, GuildMember, ActionRowBuilder, MessageComponentInteraction, EmbedBuilder, SelectMenuBuilder, Message, CommandInteractionOptionResolver, ComponentType, PermissionFlagsBits } from 'discord.js';
import EEWBot from '../../EEWBot';
import { Command } from '../../interfaces/Command';
import { intensityStringToNumber, intensityNumberToString } from '../../utils/IntensityUtil';

export default class extends Command {
  public constructor() {
    super('setting',
      'VC読み上げの設定',
      'voice',
      (new SlashCommandBuilder()
        .setName('setting')
        .setDescription('VC読み上げ設定の編集をする')
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
    if (!(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.Administrator) && !(interaction.member as GuildMember).permissions.has(PermissionFlagsBits.MoveMembers)) {
      await interaction.followUp('このコマンドは管理者権限かメンバーを移動権限を持っている人のみ使用可能です');
      return;
    }

    if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'eew') {
      const setting = client.database.getVoiceEEWSetting(interaction.guildId as string);
      if (!setting) {
        const setupMsg: Message = await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle('VC読み上げ、緊急地震速報通知設定')
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
                // これは仕方がない、仕方がないんだ
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any,
          ],
        });
        const intensityFilter = (i: MessageComponentInteraction) => (i.customId === 'intensitySelect') && i.user.id === interaction.user.id;
        const responseIntensity = await setupMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
        const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);

        client.database.addVoiceEEWSetting(interaction.guildId as string, intensity);
        await responseIntensity.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('VC読み上げ、緊急地震速報通知設定、セットアップ完了')
              .setDescription('VC読み上げ、緊急地震速報通知設定セットアップが完了しました')
              .addFields([
                { name: '通知最小震度', value: intensityNumberToString(intensity) },
              ]),

          ],
          components: [],
        });
      }
      else {
        const editMsg: Message = await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle('設定を編集する項目を選択してください')
              .addFields([
                { name: '設定項目名', value: '現在の設定' },
                { name: '最小震度', value: intensityNumberToString(setting.min_intensity) },
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any,
          ],
        });
        const editFilter = (i: MessageComponentInteraction) => (i.customId === 'editSelect') && i.user.id === interaction.user.id;
        const responseEdit = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: editFilter });
        if (responseEdit.values[0] === 'intensity') {
          await responseEdit.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('緊急地震速報読み上げの編集')
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
          const responseIntensity = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
          const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);
          client.database.editVoiceEEWSetting(setting.guild_id, intensity);
          await responseIntensity.update({
            content: `最小通知震度を${intensityNumberToString(intensity)}に変更しました`,
            embeds: [],
            components: [],
          });
        }
      }
    }
    else if ((interaction.options as CommandInteractionOptionResolver).getSubcommand() === 'quakeinfo') {
      const setting = client.database.getVoiceQuakeInfoSetting(interaction.guildId as string);
      if (!setting) {
        const setupMsg: Message = await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle('VC読み上げ、地震情報通知設定')
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

        client.database.addVoiceQuakeInfoSetting(interaction.guildId as string, intensity);
        await responseIntensity.update({
          embeds: [
            new EmbedBuilder()
              .setTitle('VC読み上げ、地震通知設定、セットアップ完了')
              .setDescription('VC読み上げ、地震速報設定セットアップが完了しました')
              .addFields([
                { name: '通知最小震度', value: intensityNumberToString(intensity) },
              ]),

          ],
          components: [],
        });
      }
      else {
        const editMsg: Message = await interaction.followUp({
          embeds: [
            new EmbedBuilder()
              .setTitle('設定を編集する項目を選択してください')
              .addFields([
                { name: '設定項目名', value: '現在の設定' },
                { name: '最小地震', value: intensityNumberToString(setting.min_intensity) },
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ) as any,
          ],
        });
        const editFilter = (i: MessageComponentInteraction) => (i.customId === 'editSelect') && i.user.id === interaction.user.id;
        const responseEdit = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: editFilter });
        if (responseEdit.values[0] === 'intensity') {
          await responseEdit.update({
            embeds: [
              new EmbedBuilder()
                .setTitle('地震通知読み上げの編集')
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
          const responseIntensity = await editMsg.awaitMessageComponent({ time: 60000, componentType: ComponentType.SelectMenu, filter: intensityFilter });
          const intensity: number = intensityStringToNumber(responseIntensity.values.shift() as string);
          client.database.editVoiceQuakeInfoSetting(setting.guild_id, intensity);
          await responseIntensity.update({
            content: `最小通知震度を${intensityNumberToString(intensity)}に変更しました`,
            embeds: [],
            components: [],
          });
        }
      }
    }
  }
}

