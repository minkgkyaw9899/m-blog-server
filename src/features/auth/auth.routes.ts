import { Router } from "express";
import { signInSchema, signUpSchema } from "./auth.schema";
import { signInController, signUpController } from "./auth.controller";
import { validatorMiddleware } from "../../middlewares/validator.middleware";

const router = Router();

router.post("/sign-in", validatorMiddleware(signInSchema), signInController);

router.post("/sign-up", validatorMiddleware(signUpSchema), signUpController);

export default router;
