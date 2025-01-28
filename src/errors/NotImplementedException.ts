import { AppError } from "./appError";

export class NotImplementedException extends AppError {
  constructor(message: string) {
    super(message, 501);
  }
}
