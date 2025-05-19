import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { UsecasesModule } from 'src/application/usecases/usecases.module';

@Module({
  controllers: [PlayerController],
  providers: [],
  exports: [],
  imports: [UsecasesModule],
})
export class ControllerModule {}
