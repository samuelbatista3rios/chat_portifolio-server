import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Erro:", err.message);
  res.status(500).json({ message: err.message || "Erro interno do servidor" });
};
