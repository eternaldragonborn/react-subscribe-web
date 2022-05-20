import { Secret } from "jsonwebtoken";
import { DateTime } from "luxon";

export const getTime = () => {
  const time = DateTime.now().setZone("Asia/Taipei");
  return time;
};

export const siteURL =
  (process.env.REACT_MODE || !process.env.DEV_MODE
    ? process.env["SITE_URL"]
    : "http://localhost") + "/subscribe-sys";

export const emojis = {
  book: "🐍",
};

//#region id
export const guilds = {
  furry: "968540758107910164",
  test: "719132687897591808",
};

export const roles = {
  subscriber: "968540758107910173",
};

const owner = "384233645621248011";
export const manager = [
  owner,
  "590430031281651722", // Traveler
  "546614210243854337", // Juxta
  "501782173364518912", // Raticate
];

// webhook
const testWebhook = "928905146849689641";
export const webhooks = process.env.DEV_MODE
  ? {
      subscribe: testWebhook,
      updateNotify: testWebhook,
      book: {
        subscriber: testWebhook,
        free: testWebhook,
      },
    }
  : {
      // not dev
      subscribe: [
        "923607751828062208", // record in test guild
        "972086281943257088", // notification
      ],
      updateNotify: "972086281943257088",
      book: {
        subscriber: "972086416513323048",
        free: "",
      },
    };
//#endregion

//#region env
export const jwt_secret = process.env.JWT_SECRET as Secret;

export const databaseConfig = {
  redis: {
    url: "redis://" + process.env["REDIS_HOST"],
    password: process.env["REDIS_PASSWD"],
  },
  postgre: {
    host: process.env["SQL_HOST"],
    username: process.env["SQL_USER"],
    password: process.env["SQL_PASSWD"],
    database: process.env["SQL_DB"],
  },
};
//#endregion
