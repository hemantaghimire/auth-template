import { AppError } from "./appError";

export class ConflictException extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}
