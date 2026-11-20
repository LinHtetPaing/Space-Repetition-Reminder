import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { TaskCard } from "@srr/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { toPublicTaskCard } from "./helpers/public-task-card";
import { parseTipTapDoc } from "./helpers/tip-tap";
import { parseTitle } from "./helpers/title";

@Injectable()
export class TaskCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    rawTitle: unknown,
    rawDescription: unknown,
  ): Promise<TaskCard> {
    const title = this.requireTitle(rawTitle);
    const description = this.requireDescription(rawDescription);

    const row = await this.prisma.taskCard.create({
      data: {
        userId,
        title,
        description: description as Prisma.InputJsonValue,
      },
    });
    return toPublicTaskCard(row);
  }

  async listForUser(userId: string): Promise<TaskCard[]> {
    const rows = await this.prisma.taskCard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toPublicTaskCard);
  }

  async getForUser(userId: string, id: string): Promise<TaskCard> {
    const row = await this.prisma.taskCard.findFirst({
      where: { id, userId },
    });
    if (!row) {
      throw new NotFoundException();
    }
    return toPublicTaskCard(row);
  }

  async updateForUser(
    userId: string,
    id: string,
    rawTitle: unknown,
    rawDescription: unknown,
  ): Promise<TaskCard> {
    const hasTitle = rawTitle !== undefined;
    const hasDescription = rawDescription !== undefined;
    if (!hasTitle && !hasDescription) {
      throw new BadRequestException(
        "at least one of title or description is required",
      );
    }

    const data: Prisma.TaskCardUpdateManyMutationInput = {};
    if (hasTitle) {
      data.title = this.requireTitle(rawTitle);
    }
    if (hasDescription) {
      data.description = this.requireDescription(
        rawDescription,
      ) as Prisma.InputJsonValue;
    }

    const result = await this.prisma.taskCard.updateMany({
      where: { id, userId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundException();
    }

    const row = await this.prisma.taskCard.findFirst({
      where: { id, userId },
    });
    if (!row) {
      throw new NotFoundException();
    }
    return toPublicTaskCard(row);
  }

  private requireTitle(value: unknown): string {
    const parsed = parseTitle(value);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.error);
    }
    return parsed.value;
  }

  private requireDescription(value: unknown) {
    const parsed = parseTipTapDoc(value);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.error);
    }
    return parsed.value;
  }
}
