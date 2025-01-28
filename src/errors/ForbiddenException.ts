import { AppError } from "./appError";

export class ForbiddenException extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}
