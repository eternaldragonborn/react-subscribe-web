import { userMention } from "@discordjs/builders";
import {
  Client,
  ColorResolvable,
  GuildMember,
  ImageURLOptions,
  MessageEmbed,
  User,
  WebhookMessageOptions,
} from "discord.js";
import _ from "lodash";
import { defaultAvatar, getTime, guilds, siteURL } from "../constant";
import { logger } from "./logger";

const bot = new Client({ intents: [32767] });

bot.on("ready", () => logger.info("Discord bot online."));

async function getUser(id: string): Promise<User | GuildMember | undefined> {
  if (id.startsWith("<@")) id = id.match(/\d+/)![0];

  const guild = await bot.guilds.fetch(guilds.furry);
  return guild.members
    .fetch(id)
    .catch(() => bot.users.fetch(id))
    .catch(() => {
      logger.warn(`無法取得使用者(${id})資料`);
      return undefined;
    });
}

export function getUserName(user: User | GuildMember | undefined) {
  if (!user) return "unknown";
  else if (user instanceof GuildMember) {
    // else if (Reflect.has(user, "displayName")) {
    user = user as GuildMember;
    const nick = user.displayName;
    const username = user.user.username;
    return nick === username ? nick : `${nick}(${username})`;
  } else {
    return (user as User).username ?? "unknown";
  }
}

const ImageURLOption: ImageURLOptions = { dynamic: true, format: "jpeg" };

function hookOption(name: string, user?: User | GuildMember | undefined) {
  const webhookOptions: WebhookMessageOptions = {
    // default setting
    avatarURL: defaultAvatar,
    username: name,
  };

  if (user) {
    webhookOptions.username = getUserName(user) + `(${name})`;
    webhookOptions.avatarURL =
      user.displayAvatarURL(ImageURLOption) ??
      user.avatarURL(ImageURLOption) ??
      defaultAvatar;
  }

  return webhookOptions;
}

//#region overload declare
async function sendWebhook(
  webhook: string | string[],
  webhookName: string,
  payload: WebhookMessageOptions | WebhookMessageOptions[],
  user?: string,
): Promise<void>;
//#endregion
async function sendWebhook(
  webhook: any,
  webhookName: string,
  payload: any,
  user?: string,
): Promise<void> {
  const options = hookOption(webhookName);
  let payloads: WebhookMessageOptions[];

  if (!Array.isArray(payload)) payloads = [_.assign(payload, options)];
  else payloads = payload.map((d) => _.assign(d, options));

  const hooks: string[] = Array.isArray(webhook) ? webhook : [webhook];

  for (const hook of hooks) {
    for (const payload of payloads) {
      if (!payload) break;
      const webhook = await bot.fetchWebhook(hook);
      await webhook.send(payload);
    }
  }
}

export async function createEmbed(
  title: string,
  color: ColorResolvable,
  user?: string,
) {
  if (process.env.DEV_MODE) title += "(測試用)";

  const embed = new MessageEmbed()
    .setTitle(title)
    .setURL(siteURL) // pending
    .setColor(color)
    .setFooter({ text: "點擊標題連結可前往網站" })
    .setTimestamp(getTime().toJSDate());
  if (user) {
    const author = await getUser(user);
    embed
      .addField("訂閱者", author ? userMention(author.id) : "unknown")
      .setAuthor({
        name: getUserName(author),
        iconURL:
          author?.displayAvatarURL(ImageURLOption) ??
          author?.avatarURL(ImageURLOption) ??
          undefined,
      });
  }

  return embed;
}

export { bot, getUser, sendWebhook };
