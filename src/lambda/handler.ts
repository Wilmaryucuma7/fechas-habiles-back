import { CompositionRoot } from '@/infrastructure/composition/CompositionRoot';
import { WorkingDateQuerySchema } from '@/shared/schemas';
import { DomainError } from '@/domain/entities/DomainError';

// AWS Lambda types (available in runtime)
interface APIGatewayProxyEvent {
  queryStringParameters: Record<string, string> | null;
  httpMethod: string;
  path: string;
}

interface APIGatewayProxyResult {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

interface Context {
  requestId: string;
  functionName: string;
}

let compositionRoot: CompositionRoot | null = null;

function getCompositionRoot(): CompositionRoot {
  if (!compositionRoot) {
    compositionRoot = CompositionRoot.getInstance();
  }
  return compositionRoot;
}

export const handler = async (
  event: APIGatewayProxyEvent, 
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('Context:', JSON.stringify(context, null, 2));

    // Handle CORS preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400'
        },
        body: ''
      };
    }

    // Route handling based on path (LambdaRestApi proxy pattern)
    const path = event.path;
    const method = event.httpMethod;

    // Handle working-date endpoint ONLY
    if (path === '/working-date' || path === '/prod/working-date' || path.endsWith('/working-date')) {
      if (method !== 'GET') {
        return {
          statusCode: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({
            error: 'InvalidParameters',
            message: 'Method not allowed'
          })
        };
      }

      return await handleWorkingDateRequest(event, context);
    }

    // Handle root path - return API info
    if (path === '/' || path === '/prod' || path === '/prod/') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Fechas Hábiles API',
          version: '1.0.0',
          endpoints: {
            'working-date': '/working-date?days={number}&hours={number}&date={ISO-8601}'
          },
          example: '/working-date?days=1&hours=3&date=2025-01-15T17:00:00.000Z'
        })
      };
    }

    // Default 404 response for unknown paths
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'NotFound',
        message: `Path not found: ${path}`
      })
    };

  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'InternalError',
        message: 'Internal server error'
      })
    };
  }
};

/**
 * Handle working date calculation requests
 */
async function handleWorkingDateRequest(
  event: APIGatewayProxyEvent, 
  context: Context
): Promise<APIGatewayProxyResult> {
  try {
    // Parse and validate query parameters
    if (!event.queryStringParameters) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'InvalidParameters',
          message: 'Missing required query parameters. Please provide days and/or hours.'
        })
      };
    }

    // Validate using existing Zod schema
    const validatedQuery = WorkingDateQuerySchema.parse(event.queryStringParameters);

    const root = getCompositionRoot();
    const useCase = root.createCalculateWorkingDateUseCase();

    // Execute business logic directly - O(1) complexity
    const result = await useCase.execute(validatedQuery);

    // Return EXACT format required by the technical test
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify(result.toJSON())
    };

  } catch (error) {
    if (error instanceof DomainError) {
      return {
        statusCode: error.code === 'VALIDATION_ERROR' ? 400 : 422,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'InvalidParameters',
          message: error.message
        })
      };
    }

    // Handle validation errors (Zod)
    if (error && typeof error === 'object' && 'issues' in error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'InvalidParameters',
          message: 'Invalid query parameters'
        })
      };
    }

    throw error; // Let the main handler catch this
  }
}