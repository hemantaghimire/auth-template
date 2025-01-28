import { AppError } from "./appError";

export class InternalServerErrorException extends AppError {
  constructor(message: string) {
    super(message, 500);
  }
}
