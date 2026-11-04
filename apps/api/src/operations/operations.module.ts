import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { OperationsController } from './operations.controller';
import { OperationsService } from './operations.service';

@Module({ imports: [AuthModule, StorageModule], controllers: [OperationsController], providers: [OperationsService] })
export class OperationsModule {}
