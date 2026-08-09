export type MediaErrorCode =
  | "AUTHENTICATION_ERROR"
  | "INVALID_REQUEST"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "API_ERROR"
  | "UNKNOWN_ERROR";

export class MediaError extends Error {
  public readonly code: MediaErrorCode;
  public readonly status?: number;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code: MediaErrorCode;
      status?: number;
      cause?: unknown;
    }
  ) {
    super(message);

    this.name = "MediaError";
    this.code = options.code;
    this.status = options.status;
    this.cause = options.cause;
  }
}