import { MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { QuakeInfoData } from '../interfaces/QuakeInfoData';
import { intensityStringToNumber } from '../utils/IntensityUtil';

let oldQuakeInfo: QuakeInfoData | null = null;

export default (client: EEWBot, quakeInfo: QuakeInfoData) => {
  if (client.database.getReportedData(quakeInfo.id)) return;

  // 震源情報が未発表
  if (quakeInfo.epicenter === '' && quakeInfo.id !== oldQuakeInfo?.id) {
    void client.voicevoxClient.notify(`先ほど最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`)
      .catch(e => client.logger.error(e));

    client.database.getAllQuakeInfoChannel(intensityStringToNumber(quakeInfo.intensity), 0)
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      .forEach(async quakeInfoChannelData => {
        const quakeInfoChannel: TextChannel = client.channels.cache.get(quakeInfoChannelData.channelid) as TextChannel;
        if (!quakeInfoChannel) {
          client.database.removeQuakeInfoChannel(quakeInfoChannelData.channelid);
          return;
        }

        await quakeInfoChannel.send({
          embeds: [
            new MessageEmbed()
              .setTitle('地震情報')
              .setDescription(`${quakeInfo.time}頃、最大震度${quakeInfo.intensity}の地震がありました、今後の地震情報に注意してください`)
              .addField('震源', '調査中')
              .addField('最大震度', quakeInfo.intensity)
              .addField('発生時刻', `${quakeInfo.time}頃`)
              .addField('震源の深さ', '調査中')
              .addField('マグニチュード', '調査中')
              .addField('北緯', '調査中')
              .addField('東経', '調査中')
              .setFooter({ text: 'NHK地震情報' })
              .setTimestamp(),
          ],
        });

        if (quakeInfoChannelData.image === 1) {
          await quakeInfoChannel.send({
            files: [
              new MessageAttachment(quakeInfo.detail),
            ],
          });
        }

        if (quakeInfoChannelData.relative === 1) {
          for (const relative of quakeInfo.relatives) {
            await quakeInfoChannel.send({
              embeds: [
                new MessageEmbed()
                  .setTitle(`震度${relative.intensity}を観測した場所`)
                  .setDescription(relative.points.join('\n')),
              ],
            });
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

  void client.voicevoxClient.notify(`${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました、震源の深さは${quakeInfo.depth}、マグニチュードは${quakeInfo.magnitude}です`)
    .catch(e => client.logger.error(e));

  client.database.getAllQuakeInfoChannel(intensityStringToNumber(quakeInfo.intensity), Number(quakeInfo.magnitude) >= 3.5 ? 1 : 0)
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    .forEach(async quakeInfoChannelData => {
      const quakeInfoChannel: TextChannel = client.channels.cache.get(quakeInfoChannelData.channelid) as TextChannel;
      if (!quakeInfoChannel) {
        client.database.removeQuakeInfoChannel(quakeInfoChannelData.channelid);
        return;
      }

      await quakeInfoChannel.send({
        embeds: [
          new MessageEmbed()
            .setTitle('地震情報')
            .setDescription(`${quakeInfo.time}頃、${quakeInfo.epicenter}を震源とする最大震度${quakeInfo.intensity}の地震がありました`)
            .addField('震源', quakeInfo.epicenter)
            .addField('最大震度', quakeInfo.intensity)
            .addField('発生時刻', `${quakeInfo.time}頃`)
            .addField('震源の深さ', quakeInfo.depth)
            .addField('マグニチュード', quakeInfo.magnitude)
            .addField('北緯', quakeInfo.latitudey)
            .addField('東経', quakeInfo.longitude)
            .setFooter({ text: 'NHK地震情報' })
            .setTimestamp(),
        ],
      });

      if (quakeInfoChannelData.image === 1) {
        await quakeInfoChannel.send({
          files: [
            new MessageAttachment(quakeInfo.detail),
            new MessageAttachment(quakeInfo.local),
            new MessageAttachment(quakeInfo.global),
          ],
        });
      }

      if (quakeInfoChannelData.relative === 1) {
        for (const relative of quakeInfo.relatives) {
          await quakeInfoChannel.send({
            embeds: [
              new MessageEmbed()
                .setTitle(`震度${relative.intensity}を観測した場所`)
                .setDescription(relative.points.join('\n')),
            ],
          });
        }
      }
    });

  oldQuakeInfo = quakeInfo;
  client.database.addReportedData(quakeInfo.id);
};
