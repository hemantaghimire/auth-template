import { Request } from "express";

export const getPaginationValues = (req: Request) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const offset = (page - 1) * limit;

  return { page, limit, offset };
};
