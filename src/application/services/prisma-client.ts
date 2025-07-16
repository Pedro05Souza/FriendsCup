import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaClientService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
}
