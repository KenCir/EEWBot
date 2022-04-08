import { codeBlock } from '@discordjs/builders';
import { Message, MessageEmbed, TextChannel } from 'discord.js';
import EEWBot from '../EEWBot';
import { EEWData } from '../interfaces/EEWData';
import EEWMonitor from './EEWMonitor';

let oldEEWData: EEWData | null = null;
let oldMsg: Message | null = null;

export default async (client: EEWBot, eewData: EEWData) => {
    if (eewData.report === 'cancel') {
        if (oldMsg) {
            await (client.channels.cache.get('888014129120567316') as TextChannel).send('EEWReport Canceled');
        }

        await (client.channels.cache.get('953857133911363614') as TextChannel).send('EEWReport Canceled');

        return;
    }

    if (oldMsg) {
        void oldMsg.delete().catch();
        oldMsg = null;
    }

    let diff = '';
    if (oldEEWData) {
        if (oldEEWData.epicenter !== eewData.epicenter) {
            diff += `震央: ${oldEEWData.epicenter} -> ${eewData.epicenter}\n`;
        }
        if (oldEEWData.depth !== eewData.depth) {
            diff += `深さ: ${oldEEWData.depth} -> ${eewData.depth}\n`;
        }
        if (oldEEWData.magnitude !== eewData.magnitude) {
            diff += `マグニチュード: ${oldEEWData.magnitude} -> ${eewData.magnitude}\n`;
        }
        if (oldEEWData.intensity !== eewData.intensity) {
            diff += `予想震度: ${oldEEWData.intensity} -> ${eewData.intensity}\n`;
        }
        if (oldEEWData.latitude !== eewData.latitude) {
            diff += `予想緯度: ${oldEEWData.latitude} -> ${eewData.latitude}\n`;
        }
        if (oldEEWData.longitude !== eewData.longitude) {
            diff += `予想経度: ${oldEEWData.longitude} -> ${eewData.longitude}\n`;
        }
    }


    // 震度3未満
    if (eewData.intensity < 3) {
        void EEWMonitor()
            .then(result => {
                if (result) {
                    void (client.channels.cache.get('953857133911363614') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
                }
            });

        if (oldEEWData && diff.length > 0) {
            await (client.channels.cache.get('953857133911363614') as TextChannel).send({
                content: codeBlock(diff),
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
        else if (!oldEEWData) {
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
    }
    // 震度3・4
    else if (eewData.intensity < 5) {
        void EEWMonitor()
            .then(result => {
                if (result) {
                    // void (client.channels.cache.get('888014129120567316') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
                    void (client.channels.cache.get('953857133911363614') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
                }
            });

        if (oldEEWData && diff.length > 0) {
            oldMsg = await (client.channels.cache.get('888014129120567316') as TextChannel).send({
                content: codeBlock(diff),
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
        else if (!oldEEWData) {
            oldMsg = await (client.channels.cache.get('888014129120567316') as TextChannel).send({
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

        if (oldEEWData && diff.length > 0) {
            await (client.channels.cache.get('953857133911363614') as TextChannel).send({
                content: codeBlock(diff),
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
        else if (!oldEEWData) {
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
    }
    else {
        void EEWMonitor()
            .then(result => {
                if (result) {
                    void (client.channels.cache.get('888014129120567316') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
                    void (client.channels.cache.get('953857133911363614') as TextChannel).send({ files: ['dat/nowMonitor.png'] });
                }
            });

        if (oldEEWData && diff.length > 0) {
            oldMsg = await (client.channels.cache.get('888014129120567316') as TextChannel).send({
                content: codeBlock(diff),
                embeds: [
                    new MessageEmbed()
                        .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                        .addField('震央', eewData.epicenter, true)
                        .addField('深さ', eewData.depth, true)
                        .addField('マグニチュード', eewData.magnitude.toString(), true)
                        .addField('予想震度', eewData.intensity.toString(), true)
                        .addField('緯度', eewData.latitude.toString(), true)
                        .addField('経度', eewData.longitude.toString(), true)
                        .setColor('RED')
                        .setTimestamp(),
                ],
            });
        }
        else if (!oldEEWData) {
            oldMsg = await (client.channels.cache.get('888014129120567316') as TextChannel).send({
                embeds: [
                    new MessageEmbed()
                        .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                        .addField('震央', eewData.epicenter, true)
                        .addField('深さ', eewData.depth, true)
                        .addField('マグニチュード', eewData.magnitude.toString(), true)
                        .addField('予想震度', eewData.intensity.toString(), true)
                        .addField('緯度', eewData.latitude.toString(), true)
                        .addField('経度', eewData.longitude.toString(), true)
                        .setColor('RED')
                        .setTimestamp(),
                ],
            });
        }

        if (oldEEWData && diff.length > 0) {
            await (client.channels.cache.get('953857133911363614') as TextChannel).send({
                content: codeBlock(diff),
                embeds: [
                    new MessageEmbed()
                        .setTitle(`緊急地震速報(予報) 第${eewData.report === 'final' ? '最終' : eewData.report}報`)
                        .addField('震央', eewData.epicenter, true)
                        .addField('深さ', eewData.depth, true)
                        .addField('マグニチュード', eewData.magnitude.toString(), true)
                        .addField('予想震度', eewData.intensity.toString(), true)
                        .addField('緯度', eewData.latitude.toString(), true)
                        .addField('経度', eewData.longitude.toString(), true)
                        .setColor('RED')
                        .setTimestamp(),
                ],
            });
        }
        else if (!oldEEWData) {
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
                        .setColor('RED')
                        .setTimestamp(),
                ],
            });
        }
    }

    oldEEWData = eewData;
};