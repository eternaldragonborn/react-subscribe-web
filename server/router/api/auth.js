import axios from "axios";
import { Router } from "express";
import qs from "qs";
import jwt from "jsonwebtoken";
import { guilds, jwt_secret, siteURL } from "../../constant";
import { logger, verifyToken } from "../../modules";

const auth = Router();
auth.get("/test", (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

auth.post("/discord", async (req, res) => {
  const { code } = req.body;
  try {
    const { access_token, refresh_token } = await axios // get access_token
      .post(
        "https://discord.com/api/oauth2/token",
        qs.stringify({
          client_id: process.env.DISCORD_ID,
          client_secret: process.env.DISCORD_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: siteURL + "/authenticate",
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      )
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        if (err.response) logger.error(err.response.data);
        else logger.error(err);
        throw Error("取得token失敗");
      });

    const user = (
      await axios.get(
        // use token to get user data
        `https://discordapp.com/api/users/@me/guilds/${guilds.furry}/member`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
    ).data;

    // set jwt payload
    const payload = { id: user.user.id };

    const token = jwt.sign(payload, jwt_secret); // set jwt token

    res.send(token).status(200);
  } catch (err) {
    console.log("驗證錯誤，" + err.message);
    res.sendStatus(403);
  }
});

auth.get("/getuser", async (req, res) => {
  const user = await verifyToken(req.headers);
  if (!user) res.sendStatus(403);
  else {
    res.json(user);
  }
});

export { auth };
