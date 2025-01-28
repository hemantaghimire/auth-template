import { AppError } from "./appError";

export class RequestTimeoutException extends AppError {
  constructor(message: string) {
    super(message, 408);
  }
}
