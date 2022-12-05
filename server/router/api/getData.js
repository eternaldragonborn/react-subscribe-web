import {Router} from "express";
import _ from "lodash";
import {loaddata, verifyToken} from "../../modules";

const data = Router();

// data.use(verify);

data.get("/overview", async (req, res) => {
  const user = await verifyToken(req.headers);
  if (!user) {
    res.sendStatus(403);
    return;
  }

  try {
    let data = await loaddata();

    if (user.status === "user") data = _.omit(data, ["subscribers"]);
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
});

export {data};
