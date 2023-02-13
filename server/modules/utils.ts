import {
  GuildMember,
  MessageAttachment,
  MessageEmbed,
  WebhookMessageOptions,
} from "discord.js";
import jwt from "jsonwebtoken";
import { jwt_secret, roles, manager } from "../constant";
import { getUser } from "./discordbot";
import { logger } from "./logger";

interface UserPayload extends jwt.JwtPayload {
  id: string;
  status: "user" | "manager" | "subscriber";
}

export const verifyToken = async (
  header: import("http").IncomingHttpHeaders,
): Promise<UserPayload | undefined> => {
  const token = header.authorization?.split(" ")[1] ?? "";
  try {
    const payload: UserPayload = jwt.verify(token, jwt_secret) as UserPayload;
    if (!payload.id.match(/^\d*$/)) throw Error("invalid token");
    const user = (await getUser(payload.id)) as GuildMember;

    if (user.guild) {
      if (user.roles?.cache.find((role) => role.id === roles.subscriber)) {
        payload.status = manager.includes(payload.id)
          ? "manager"
          : "subscriber";
      } else {
        payload.status = "user";
      }
    } else {
      throw Error("not guild member");
    }

    return payload;
  } catch (err: any) {
    logger.error(err.message);
    return undefined;
  }
};

export const getTokenId = (header: import("http").IncomingHttpHeaders) => {
  const token = header.authorization?.split(" ")[1] ?? "";
  const payload = jwt.verify(token, jwt_secret) as jwt.JwtPayload;

  return payload.id;
};

type File = Express.Multer.File;
export const setPayload = (
  embed: MessageEmbed,
  files: { [key: string]: File[] } | File[] | undefined,
) => {
  const payload: WebhookMessageOptions[] = [];

  if (files?.length) {
    const [image, ...attachments] = (files as File[]).map(
      (file) => new MessageAttachment(file.buffer, file.originalname),
    );
    embed.setImage(`attachment://${image.name}`);
    payload.push({ embeds: [embed], files: [image] });

    if (attachments.length) payload.push({ content: " ", files: attachments });
  } else payload.push({ embeds: [embed] });

  return payload;
};

export async function asyncExecute<T>(
  fn: Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn;
    return [result, null];
  } catch (e: any) {
    return [null, e];
  }
}
