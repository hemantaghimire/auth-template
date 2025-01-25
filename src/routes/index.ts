import express from "express";
import authrouter from "./auth.route";

const router = express.Router();

router.use("/auth", authrouter);

export default router;
