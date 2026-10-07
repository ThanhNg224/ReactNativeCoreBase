type Meta = Record<string, string | number | boolean>;

// Never pass tokens, response bodies, credentials or personal information.
export const logger = {
  scope(name: string) {
    return {
      debug: (message: string, meta?: Meta) => {
        if (__DEV__) console.debug(`[${name}] ${message}`, meta ?? {});
      },
      info: (message: string, meta?: Meta) => {
        if (__DEV__) console.info(`[${name}] ${message}`, meta ?? {});
      },
      warn: (message: string, meta?: Meta) => console.warn(`[${name}] ${message}`, meta ?? {}),
      error: (message: string, meta?: Meta) => console.error(`[${name}] ${message}`, meta ?? {}),
    };
  },
};
