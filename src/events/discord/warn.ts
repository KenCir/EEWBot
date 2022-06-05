import EEWBot from '../../EEWBot';

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export default (client: EEWBot, info: string) => {
  client.logger.warn(info);
};

