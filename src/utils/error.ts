const errors = {
  BAD_REQUEST: {
    status: 400,
    code: 'BAD_REQUEST',
  },
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
  },
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(
    statusCode: number = errors.INTERNAL_SERVER_ERROR.status,
    code: string = errors.INTERNAL_SERVER_ERROR.code,
    message: string = 'Internal server error',
    isOperational: boolean = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    isOperational: boolean = true,
  ) {
    super(
      errors.NOT_FOUND.status,
      errors.NOT_FOUND.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', isOperational: boolean = true) {
    super(
      errors.BAD_REQUEST.status,
      errors.BAD_REQUEST.code,
      message,
      isOperational,
    );
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(
    message: string = 'External service error',
    service: string = 'external',
  ) {
    super(502, `${service.toUpperCase()}_ERROR`, message);
    this.service = service;
    Object.setPrototypeOf(this, ExternalServiceError.prototype);
  }
}
