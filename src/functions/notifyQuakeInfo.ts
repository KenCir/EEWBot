import { MessageAttachment, MessageEmbed, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { QuakeInfoData } from '../interfaces/QuakeInfoData';
import { intensityStringToNumber } from '../utils/IntensityUtil';

// eslint-disable-next-line @typescript-eslint/require-await
export default (client: EEWBot, quakeInfo: QuakeInfoData) => {
    if (client.database.getReportedData(quakeInfo.id)) return;

    client.database.getAllQuakeInfo_Intensity(intensityStringToNumber(quakeInfo.intensity))
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
                        .addField('最大震度', quakeInfo.intensity)
                        .addField('発生時刻', `${quakeInfo.time}頃`)
                        .addField('震源の深さ', quakeInfo.depth)
                        .addField('マグニチュード', quakeInfo.magnitude)
                        .addField('北緯', quakeInfo.latitudey)
                        .addField('東経', quakeInfo.longitude)
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

    client.database.addReportedData(quakeInfo.id);
};