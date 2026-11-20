import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  AccessAuthGuard,
  type AuthenticatedRequest,
} from "../auth/guards/access-auth.guard";
import { CreateTaskCardDto } from "./dto/create-task-card.dto";
import { UpdateTaskCardDto } from "./dto/update-task-card.dto";
import { TaskCardsService } from "./task-cards.service";

@Controller("task-cards")
@UseGuards(AccessAuthGuard)
export class TaskCardsController {
  constructor(private readonly taskCards: TaskCardsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Req() req: AuthenticatedRequest,
    @Body() body: CreateTaskCardDto,
  ) {
    const taskCard = await this.taskCards.create(
      req.userId,
      body.title,
      body.description,
    );
    return { taskCard };
  }

  @Get()
  async list(@Req() req: AuthenticatedRequest) {
    const taskCards = await this.taskCards.listForUser(req.userId);
    return { taskCards };
  }

  @Get(":id")
  async get(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    const taskCard = await this.taskCards.getForUser(req.userId, id);
    return { taskCard };
  }

  @Patch(":id")
  async update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateTaskCardDto,
  ) {
    const taskCard = await this.taskCards.updateForUser(
      req.userId,
      id,
      body.title,
      body.description,
    );
    return { taskCard };
  }
}
