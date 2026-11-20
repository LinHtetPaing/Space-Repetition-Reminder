import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import cookieParser = require("cookie-parser");
import request = require("supertest");
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

const emptyDoc = { type: "doc" as const };
const paragraphDoc = {
  type: "doc" as const,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "body" }],
    },
  ],
};

describe("Task Cards API (e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;

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

  async function registerAgent(prefix: string) {
    const email = uniqueEmail(prefix);
    const agent = request.agent(app.getHttpServer());
    const register = await agent.post("/auth/register").send({
      email,
      password: "password1",
      confirmPassword: "password1",
    });
    expect(register.status).toBe(201);
    return { agent, email, userId: register.body.user.id as string };
  }

  it("creates, lists, gets, and patches a task card", async () => {
    const { agent } = await registerAgent("owner");

    const created = await agent.post("/task-cards").send({
      title: "  First card  ",
      description: paragraphDoc,
    });
    expect(created.status).toBe(201);
    expect(created.body.taskCard.title).toBe("First card");
    expect(created.body.taskCard.description).toEqual(paragraphDoc);
    expect(created.body.taskCard.id).toBeTruthy();
    expect(created.body.taskCard.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T.*Z$/,
    );
    expect(created.body.taskCard.updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T.*Z$/,
    );

    const cardId = created.body.taskCard.id as string;
    const createdUpdatedAt = created.body.taskCard.updatedAt as string;

    const list = await agent.get("/task-cards");
    expect(list.status).toBe(200);
    expect(list.body.taskCards).toHaveLength(1);
    expect(list.body.taskCards[0].id).toBe(cardId);

    const got = await agent.get(`/task-cards/${cardId}`);
    expect(got.status).toBe(200);
    expect(got.body.taskCard.title).toBe("First card");

    await new Promise((r) => setTimeout(r, 20));

    const patched = await agent.patch(`/task-cards/${cardId}`).send({
      title: "Renamed",
    });
    expect(patched.status).toBe(200);
    expect(patched.body.taskCard.title).toBe("Renamed");
    expect(patched.body.taskCard.description).toEqual(paragraphDoc);
    expect(
      new Date(patched.body.taskCard.updatedAt).getTime(),
    ).toBeGreaterThan(new Date(createdUpdatedAt).getTime());

    const gotAgain = await agent.get(`/task-cards/${cardId}`);
    expect(gotAgain.status).toBe(200);
    expect(gotAgain.body.taskCard.title).toBe("Renamed");
    expect(
      new Date(gotAgain.body.taskCard.updatedAt).getTime(),
    ).toBeGreaterThan(new Date(createdUpdatedAt).getTime());
  });

  it("returns 404 when another user requests the card", async () => {
    const owner = await registerAgent("owner2");
    const created = await owner.agent.post("/task-cards").send({
      title: "Private",
      description: emptyDoc,
    });
    expect(created.status).toBe(201);
    const cardId = created.body.taskCard.id as string;

    const other = await registerAgent("intruder");
    const got = await other.agent.get(`/task-cards/${cardId}`);
    expect(got.status).toBe(404);

    const patched = await other.agent.patch(`/task-cards/${cardId}`).send({
      title: "Hijacked",
    });
    expect(patched.status).toBe(404);
  });

  it("rejects HTML string description on create", async () => {
    const { agent } = await registerAgent("html");
    const res = await agent.post("/task-cards").send({
      title: "Bad",
      description: "<p>nope</p>",
    });
    expect(res.status).toBe(400);
  });

  it("rejects empty patch body", async () => {
    const { agent } = await registerAgent("emptypatch");
    const created = await agent.post("/task-cards").send({
      title: "Card",
      description: emptyDoc,
    });
    const cardId = created.body.taskCard.id as string;

    const res = await agent.patch(`/task-cards/${cardId}`).send({});
    expect(res.status).toBe(400);
  });

  it("requires auth", async () => {
    const res = await request(app.getHttpServer()).get("/task-cards");
    expect(res.status).toBe(401);
  });
});
