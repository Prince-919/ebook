import dotenv from "dotenv";
dotenv.config();

const _config: Record<string, string | undefined> = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING,
  mailtrapUser: process.env.MAILTRAP_TEST_USER,
  mailtrapPass: process.env.MAILTRAP_TEST_PASS,
  verificationMail: process.env.VERIFICATION_MAIL,
  verificationLink: process.env.VERIFICATION_LINK,
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
