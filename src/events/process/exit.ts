import EEWBot from '../../EEWBot';

export default (client: EEWBot, code: number) => {
    client.logger.info(`コード${code}で終了しました`);
    client.shutdown();
};