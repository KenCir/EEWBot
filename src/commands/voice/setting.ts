import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, CacheType, GuildMember, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed, MessageSelectMenu, Message } from 'discord.js';
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
    if (!(interaction.member as GuildMember).permissions.has('ADMINISTRATOR') && !(interaction.member as GuildMember).permissions.has('MOVE_MEMBERS')) {
      await interaction.followUp('このコマンドは管理者権限かメンバーを移動権限を持っている人のみ使用可能です');
      return;
    }

    if (interaction.options.getSubcommand() === 'eew') {
      const setting = client.database.getVoiceSetting(interaction.guildId as string);
      if (!setting) {
        const filter = (i: MessageComponentInteraction) => (i.customId === 'ok' || i.customId === 'no') && i.user.id === interaction.user.id;
        const setupMsg: Message = await interaction.followUp({
          embeds: [
            new MessageEmbed()
              .setTitle('VC読み上げ、緊急地震速報通知設定')
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
    }
  }
}
