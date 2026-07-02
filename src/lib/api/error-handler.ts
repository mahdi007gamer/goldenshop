export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Error) {
    return new ApiError(error.message, "UNKNOWN_ERROR", 500);
  }

  return new ApiError("An unexpected error occurred", "UNKNOWN_ERROR", 500);
}
