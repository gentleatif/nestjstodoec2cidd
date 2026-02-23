import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { configure as serverlessExpress } from '@codegenie/serverless-express';
import type { Callback, Context, Handler } from 'aws-lambda';

const APP_PORT = process.env.PORT ?? 3000;

// Cached application instance and serverless handler
let app: INestApplication;
let server: Handler;

/**
 * Bootstraps the NestJS application.
 * This function is called ONCE per Lambda container. It creates and initializes the app.
 * @returns A promise that resolves to the fully initialized NestJS app instance.
 */
async function bootstrap(): Promise<INestApplication> {
  const nestApp = await NestFactory.create(AppModule);

  // Global validation pipe
  nestApp.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
    }),
  );

  // Cookie parser middleware
  nestApp.use(cookieParser());

  nestApp.enableCors({
    // Saare origins allow karne ke liye
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // allow helmet to all origins
  nestApp.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['*'],
          imgSrc: ['*', 'data:', 'blob:'],
          scriptSrc: ['*', "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ['*', "'unsafe-inline'"],
          connectSrc: ['*'],
          fontSrc: ['*', 'data:'],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // This call is crucial. It triggers all onModuleInit hooks, including Firebase initialization.
  // If any onModuleInit hook fails, this promise will reject, causing the Lambda to fail fast.
  await nestApp.init();

  return nestApp;
}

// Start the bootstrap process as soon as the module is loaded.
// All incoming handlers will wait for this promise to resolve.
const bootstrapPromise = bootstrap();

/**
 * 👉 Local mode (`yarn start:dev` or `nest start`)
 */
if (process.env.IS_OFFLINE !== 'true') {
  bootstrapPromise.then((nestApp) => {
    nestApp.listen(APP_PORT, () =>
      console.log(`🚀 Server running at http://localhost:${APP_PORT}`),
    );
  });
}

/**
 * 👉 Main Lambda handler for API Gateway events.
 */
export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  // Ensure the application is bootstrapped. On subsequent warm invocations, this will be instant.
  app = app ?? (await bootstrapPromise);

  // 🧠 If event looks like a direct AWS Scheduler call (non-HTTP)

  // 🌐 Otherwise, assume normal API Gateway / Express event.
  // Initialize serverlessExpress handler on the first invocation and cache it.
  server =
    server ?? serverlessExpress({ app: app.getHttpAdapter().getInstance() });
  return server(event, context, callback);
};

/**
 * 👉 Separate Lambda handler for scheduled raffle status updates.
 */
export const updateRaffleStatusHandler: Handler = async (event: any) => {
  // Ensure the application is bootstrapped before getting services.
  app = app ?? (await bootstrapPromise);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello World from NestJS!' }),
  };
};
