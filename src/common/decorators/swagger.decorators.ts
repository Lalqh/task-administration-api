import { applyDecorators } from '@nestjs/common';
import {
  ApiSecurity,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';

export function ApiAuthHeader() {
  return applyDecorators(
    ApiSecurity('x-user-id'),
    ApiUnauthorizedResponse({
      description: 'Missing or invalid x-user-id',
      content: {
        'application/json': {
          schema: {
            example: {
              statusCode: 401,
              message: 'Unauthorized',
              error: 'Unauthorized',
            },
          },
        },
      },
    }),
  );
}

export function ApiValidationError() {
  return ApiBadRequestResponse({
    description: 'Validation error',
    content: {
      'application/json': {
        schema: {
          example: {
            statusCode: 400,
            message: ['Validation failed'],
            error: 'Bad Request',
          },
        },
      },
    },
  });
}

export function ApiNotFound(message = 'Resource not found') {
  return ApiNotFoundResponse({
    description: message,
    content: {
      'application/json': {
        schema: {
          example: {
            statusCode: 404,
            message,
            error: 'Not Found',
          },
        },
      },
    },
  });
}

export function ApiIdParam(name = 'id', example = 123, description = 'Resource identifier') {
  return ApiParam({ name, type: Number, example, description });
}