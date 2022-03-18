import { MessageEmbed, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { EEWData } from '../interfaces/EEWData';
import EEWMonitor from './EEWMonitor';

export default async (client: EEWBot, eewData: EEWData) => {
    // 震度3未満
    if (eewData.intensity < 3) {
        void EEWMonitor()
            .then(() => {
                void (client.channels.cache.get('888014129120567316') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
            });

        await (client.channels.cache.get('953857133911363614') as TextChannel).send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                    .addField('震央', eewData.epicenter, true)
                    .addField('深さ', eewData.depth, true)
                    .addField('マグニチュード', eewData.magnitude.toString(), true)
                    .addField('予想震度', eewData.intensity.toString(), true)
                    .addField('緯度', eewData.latitude.toString(), true)
                    .addField('経度', eewData.longitude.toString(), true)
                    .setColor('AQUA')
                    .setTimestamp(),
            ],
        });
    }
    // 震度3・4
    else if (eewData.intensity < 5) {
        void EEWMonitor()
            .then(() => {
                void (client.channels.cache.get('888014129120567316') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
            });

        await (client.channels.cache.get('888014129120567316') as TextChannel).send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                    .addField('震央', eewData.epicenter, true)
                    .addField('深さ', eewData.depth, true)
                    .addField('マグニチュード', eewData.magnitude.toString(), true)
                    .addField('予想震度', eewData.intensity.toString(), true)
                    .addField('緯度', eewData.latitude.toString(), true)
                    .addField('経度', eewData.longitude.toString(), true)
                    .setColor('YELLOW')
                    .setTimestamp(),
            ],
        });

        await (client.channels.cache.get('953857133911363614') as TextChannel).send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                    .addField('震央', eewData.epicenter, true)
                    .addField('深さ', eewData.depth, true)
                    .addField('マグニチュード', eewData.magnitude.toString(), true)
                    .addField('予想震度', eewData.intensity.toString(), true)
                    .addField('緯度', eewData.latitude.toString(), true)
                    .addField('経度', eewData.longitude.toString(), true)
                    .setColor('YELLOW')
                    .setTimestamp(),
            ],
        });
    }
    else {
        void EEWMonitor()
            .then(() => {
                void (client.channels.cache.get('888014129120567316') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
            });

        await (client.channels.cache.get('888014129120567316') as TextChannel).send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                    .addField('震央', eewData.epicenter, true)
                    .addField('深さ', eewData.depth, true)
                    .addField('マグニチュード', eewData.magnitude.toString(), true)
                    .addField('予想震度', eewData.intensity?.toString() ?? eewData.intensity, true)
                    .addField('緯度', eewData.latitude.toString(), true)
                    .addField('経度', eewData.longitude.toString(), true)
                    .setColor('RED')
                    .setTimestamp(),
            ],
        });

        await (client.channels.cache.get('953857133911363614') as TextChannel).send({
            embeds: [
                new MessageEmbed()
                    .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                    .addField('震央', eewData.epicenter, true)
                    .addField('深さ', eewData.depth, true)
                    .addField('マグニチュード', eewData.magnitude.toString(), true)
                    .addField('予想震度', eewData.intensity?.toString() ?? eewData.intensity, true)
                    .addField('緯度', eewData.latitude.toString(), true)
                    .addField('経度', eewData.longitude.toString(), true)
                    .setColor('YELLOW')
                    .setTimestamp(),
            ],
        });
    }
};