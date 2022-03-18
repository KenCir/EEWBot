import EEWBot from '../../EEWBot';

export default (client: EEWBot) => {
    client.user?.setActivity(`${process.env.PREFIX as string}help`);
    client.logger.info(`Logged in as ${client.user?.tag as string}`);
};