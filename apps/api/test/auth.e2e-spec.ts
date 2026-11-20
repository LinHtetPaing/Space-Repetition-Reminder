import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser = require("cookie-parser");
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { RedisService } from "../src/redis/redis.service";
import { refreshKey } from "../src/auth/auth.constants";

function cookieHeaderList(
  value: string | string[] | undefined,
): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

describe("Auth API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    redis = app.get(RedisService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  function uniqueEmail(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
  }

  it("rejects register when password and confirmPassword differ", async () => {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        email: uniqueEmail("mismatch"),
        password: "password1",
        confirmPassword: "password2",
      });

    expect(res.status).toBe(400);
  });

  it("rejects duplicate email on register", async () => {
    const email = uniqueEmail("dup");
    const body = {
      email,
      password: "password1",
      confirmPassword: "password1",
    };

    await request(app.getHttpServer()).post("/auth/register").send(body);
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send(body);

    expect(res.status).toBe(409);
  });

  it("registers, returns me, logs out", async () => {
    const email = uniqueEmail("flow");
    const agent = request.agent(app.getHttpServer());

    const register = await agent.post("/auth/register").send({
      email: email.toUpperCase(),
      password: "password1",
      confirmPassword: "password1",
    });

    expect(register.status).toBe(201);
    expect(register.body.user.email).toBe(email.toLowerCase());
    expect(register.body.user.id).toBeTruthy();
    expect(register.body.user.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T.*Z$/,
    );
    expect(cookieHeaderList(register.headers["set-cookie"])).toEqual(
      expect.arrayContaining([
        expect.stringContaining("access_token="),
        expect.stringContaining("refresh_token="),
      ]),
    );

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email.toLowerCase());

    const logout = await agent.post("/auth/logout");
    expect(logout.status).toBe(204);

    const meAfter = await agent.get("/auth/me");
    expect(meAfter.status).toBe(401);
  });

  it("logs in with valid credentials and sets cookies", async () => {
    const email = uniqueEmail("login");
    await request(app.getHttpServer()).post("/auth/register").send({
      email,
      password: "password1",
      confirmPassword: "password1",
    });

    const agent = request.agent(app.getHttpServer());
    const login = await agent.post("/auth/login").send({
      email,
      password: "password1",
    });

    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe(email);
    expect(cookieHeaderList(login.headers["set-cookie"])).toEqual(
      expect.arrayContaining([
        expect.stringContaining("access_token="),
        expect.stringContaining("refresh_token="),
      ]),
    );

    const me = await agent.get("/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it("returns 401 for me without access cookie", async () => {
    const res = await request(app.getHttpServer()).get("/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 for bad login credentials", async () => {
    const email = uniqueEmail("badlogin");
    await request(app.getHttpServer()).post("/auth/register").send({
      email,
      password: "password1",
      confirmPassword: "password1",
    });

    const res = await request(app.getHttpServer()).post("/auth/login").send({
      email,
      password: "wrongpass",
    });

    expect(res.status).toBe(401);
  });

  it("deletes refresh session from Redis on logout", async () => {
    const email = uniqueEmail("redis");
    const agent = request.agent(app.getHttpServer());

    const register = await agent.post("/auth/register").send({
      email,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(register.status).toBe(201);

    const cookies = cookieHeaderList(register.headers["set-cookie"]);
    const refreshCookie = cookies.find((c) => c.startsWith("refresh_token="));
    expect(refreshCookie).toBeTruthy();
    const refreshToken = refreshCookie!.split(";")[0].split("=")[1];

    const { JwtService } = await import("@nestjs/jwt");
    const jwt = new JwtService();
    const claims = jwt.verify<{ jti: string }>(refreshToken, {
      secret:
        process.env.JWT_REFRESH_SECRET ??
        "change-me-refresh-secret-min-32-chars",
    });

    const before = await redis.getJson(refreshKey(claims.jti));
    expect(before).toMatchObject({ userId: register.body.user.id });

    const logout = await agent.post("/auth/logout");
    expect(logout.status).toBe(204);

    const after = await redis.getJson(refreshKey(claims.jti));
    expect(after).toBeNull();
  });
});
