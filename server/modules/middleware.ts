import { NextFunction, Request, Response } from "express";
import { logger } from "./logger";
import { verifyToken } from "./utils";

export const verifyIsUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (await verifyToken(req.headers)) next();
  else res.status(403).send("驗證錯誤，請重新登入網頁。");
};

export const verifyIsSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await verifyToken(req.headers);
  if (user && user?.status !== "user") next();
  else res.status(403).send("驗證錯誤，該動作限管理員可執行。");
};

export const verifyForm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const id: string = req.body.id;
  const user = await verifyToken(req.headers);
  if (
    (id === `<@${user?.id}>` && user?.status !== "user") ||
    user?.status === "manager"
  )
    next();
  else {
    logger.error(`${user?.id} 驗證錯誤(form id: ${id})`);
    res.status(403).send("驗證錯誤，僅限本人或管理員進行該動作。");
  }
};

export const verifyIsManager = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if ((await verifyToken(req.headers))?.status === "manager") next();
  else res.status(403).send("驗證錯誤，該動作限管理員可執行。");
};
