import { roleMention } from '@discordjs/builders';
import { AttachmentBuilder, EmbedBuilder, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { QuakeInfoData } from '../interfaces/QuakeInfoData';
import { intensityStringToNumber } from '../utils/IntensityUtil';

let oldQuakeInfo: QuakeInfoData | null = null;

export default (client: EEWBot, quakeInfo: QuakeInfoData) => {
  if (client.database.getReportedData(quakeInfo.id)) return;

  // 震源情報が未発表
  if (quakeInfo.epicenter === '' && quakeInfo.id !== oldQuakeInfo?.id) {
    const notifyGuilds = client.database.getAllVoiceQuakeInfoSetting(intensityStringToNumber(quakeInfo.intensity)).map(setting => setting.guild_id);
    void client.voicevoxClient.notify(`先ほど最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`, notifyGuilds)
      .catch(e => client.logger.error(e));

    client.database.getAllQuakeInfoChannel(intensityStringToNumber(quakeInfo.intensity))
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach(async quakeInfoChannelData => {
        const quakeInfoChannel: TextChannel = client.channels.cache.get(quakeInfoChannelData.channel_id) as TextChannel;
        if (!quakeInfoChannel) {
          client.database.removeQuakeInfoChannel(quakeInfoChannelData.channel_id);
          return;
        }

        await quakeInfoChannel.send({
          content: quakeInfoChannelData.mention_roles.length < 1 ? '地震情報' : quakeInfoChannelData.mention_roles.map(role => roleMention(role)).join(''),
          embeds: [
            new EmbedBuilder()
              .setTitle('地震情報')
              .setDescription(`${quakeInfo.time}頃、最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`)
              .addFields([
                { name: '震源', value: '調査中' },
                { name: '最大震度', value: quakeInfo.intensity },
                { name: '発生時刻', value: `${quakeInfo.time}頃` },
                { name: '震源の深さ', value: '調査中' },
                { name: 'マグニチュード', value: '調査中' },
                { name: '北緯', value: '調査中' },
                { name: '東経', value: '調査中' },
              ])
              .setFooter({ text: 'NHK地震情報' })
              .setTimestamp(),
          ],
        });

        if (quakeInfoChannelData.image === 1) {
          await quakeInfoChannel.send({
            files: [
              new AttachmentBuilder(quakeInfo.detail),
            ],
          });
        }

        if (quakeInfoChannelData.relative === 1) {
          if (quakeInfo.relatives instanceof Array) {
            for (const relative of quakeInfo.relatives) {
              await quakeInfoChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`震度${relative.intensity}を観測した場所`)
                    .setDescription(relative.points.join('\n')),
                ],
              });
            }
          }
          else if (quakeInfo.relatives instanceof Object) {
            for (const relative in quakeInfo.relatives) {
              await quakeInfoChannel.send({
                embeds: [
                  new EmbedBuilder()
                    .setTitle(`震度${quakeInfo.relatives[relative].intensity}を観測した場所`)
                    .setDescription(quakeInfo.relatives[relative].points.join('\n')),
                ],
              });
            }
          }
        }
      });

    oldQuakeInfo = quakeInfo;
    return;
  }
  // 一応更新
  else if (quakeInfo.epicenter === '') {
    oldQuakeInfo = quakeInfo;

    return;
  }
  else if (quakeInfo.local === 'http://www3.nhk.or.jp/sokuho/jishin/' || quakeInfo.global === 'http://www3.nhk.or.jp/sokuho/jishin/') {
    oldQuakeInfo = quakeInfo;

    return;
  }

  const notifyGuilds = client.database.getAllVoiceQuakeInfoSetting(intensityStringToNumber(quakeInfo.intensity)).map(setting => setting.guild_id);
  void client.voicevoxClient.notify(`${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました、震源の深さは${quakeInfo.depth}、マグニチュードは${quakeInfo.magnitude}です`, notifyGuilds)
    .catch(e => client.logger.error(e));

  client.database.getAllQuakeInfoChannel(intensityStringToNumber(quakeInfo.intensity))
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .forEach(async quakeInfoChannelData => {
      const quakeInfoChannel: TextChannel = client.channels.cache.get(quakeInfoChannelData.channel_id) as TextChannel;
      if (!quakeInfoChannel) {
        client.database.removeQuakeInfoChannel(quakeInfoChannelData.channel_id);
        return;
      }

      await quakeInfoChannel.send({
        content: quakeInfoChannelData.mention_roles.length < 1 ? '地震情報' : quakeInfoChannelData.mention_roles.map(role => roleMention(role)).join(''),
        embeds: [
          new EmbedBuilder()
            .setTitle('地震情報')
            .setDescription(`${quakeInfo.time}頃、${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました`)
            .addFields([
              { name: '震源', value: quakeInfo.epicenter },
              { name: '最大震度', value: quakeInfo.intensity },
              { name: '発生時刻', value: `${quakeInfo.time}頃` },
              { name: '震源の深さ', value: quakeInfo.depth },
              { name: 'マグニチュード', value: quakeInfo.magnitude },
              { name: '北緯', value: quakeInfo.latitudey },
              { name: '東経', value: quakeInfo.longitude },
            ])
            .setFooter({ text: 'NHK地震情報' })
            .setTimestamp(),
        ],
      });

      if (quakeInfoChannelData.image === 1) {
        await quakeInfoChannel.send({
          files: [
            new AttachmentBuilder(quakeInfo.detail),
            new AttachmentBuilder(quakeInfo.local),
            new AttachmentBuilder(quakeInfo.global),
          ],
        });
      }

      if (quakeInfoChannelData.relative === 1) {
        if (quakeInfo.relatives instanceof Array) {
          for (const relative of quakeInfo.relatives) {
            await quakeInfoChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setTitle(`震度${relative.intensity}を観測した場所`)
                  .setDescription(relative.points.join('\n')),
              ],
            });
          }
        }
        else if (quakeInfo.relatives instanceof Object) {
          for (const relative in quakeInfo.relatives) {
            await quakeInfoChannel.send({
              embeds: [
                new EmbedBuilder()
                  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                  .setTitle(`震度${quakeInfo.relatives[relative].intensity}を観測した場所`)
                  .setDescription(quakeInfo.relatives[relative].points.join('\n')),
              ],
            });
          }
        }
      }
    });

  oldQuakeInfo = quakeInfo;
  client.database.addReportedData(quakeInfo.id);
};
