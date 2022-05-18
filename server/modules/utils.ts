import { GuildMember } from "discord.js";
import jwt from "jsonwebtoken";
import { jwt_secret, roles, manager } from "../constant";
import { getUser } from "./discordbot.js";

interface UserPayload extends jwt.JwtPayload {
  id: string;
  status: "user" | "manager" | "subscriber";
}
export const verifyToken = async (
  header: import("http").IncomingHttpHeaders,
): Promise<UserPayload | undefined> => {
  const token = header.authorization?.split(" ")[1] ?? "";
  try {
    const payload: UserPayload = jwt.verify(
      token,
      jwt_secret,
    ) as jwt.JwtPayload;
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
    console.log(err.message);
    return undefined;
  }
};

// export const setAttachments = (files: ) => {};
