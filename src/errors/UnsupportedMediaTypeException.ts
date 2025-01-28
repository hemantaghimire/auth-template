import { AppError } from "./appError";

export class UnsupportedMediaTypeException extends AppError {
  constructor(message: string) {
    super(message, 415);
  }
}
