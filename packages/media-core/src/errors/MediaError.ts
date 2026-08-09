export type MediaErrorCode =
  | "AUTHENTICATION_ERROR"
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "API_ERROR";

export interface MediaErrorOptions {
  code: MediaErrorCode;
  status?: number;
  cause?: unknown;
}

export class MediaError extends Error {
  readonly code: MediaErrorCode;
  readonly status?: number;

  constructor(
    message: string,
    options: MediaErrorOptions
  ) {
    super(message);

    this.name = "MediaError";

    this.code = options.code;
    this.status =
      options.status;

    if (options.cause) {
      this.cause = options.cause;
    }

    Object.setPrototypeOf(
      this,
      MediaError.prototype
    );
  }
}