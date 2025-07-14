import { Module } from '@nestjs/common';
import { RepositoriesModule } from './repositories/repositories.module';

@Module({
  controllers: [],
  providers: [RepositoriesModule],
  exports: [RepositoriesModule],
  imports: [],
})
export class InfraestructureModule {}
