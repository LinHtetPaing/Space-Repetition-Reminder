import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
  app.enableCors({ origin, credentials: true });
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
