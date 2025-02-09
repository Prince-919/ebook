import dotenv from "dotenv";
dotenv.config();

const _config: Record<string, string | undefined> = {
  port: process.env.PORT,
};

const config = {
  get(key: string) {
    const value = _config[key];
    if (!value) {
      console.log(
        `The ${key} variable not found, Make sure to pass environment variable.`
      );
    }
    return value;
  },
};
export default config;
