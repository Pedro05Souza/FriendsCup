import { Module } from '@nestjs/common';
import { PrismaClientService } from './prisma-client';

@Module({
  imports: [],
  controllers: [],
  providers: [PrismaClientService],
  exports: [PrismaClientService],
})
export class ServicesModule {}
