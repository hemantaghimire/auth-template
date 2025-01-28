import { AppError } from "./appError";

export class PayloadTooLargeException extends AppError {
  constructor(message: string) {
    super(message, 413);
  }
}
