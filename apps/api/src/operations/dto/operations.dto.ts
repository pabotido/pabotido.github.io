import type { Prisma } from '@prisma/client';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDocumentDto {
  @IsString() @MinLength(1) @MaxLength(255) name!: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string;
  @IsOptional() @IsString() @MaxLength(1000) folderPath?: string;
  @IsString() @MaxLength(150) mimeType!: string;
  @Type(() => Number) @IsInt() @Min(0) sizeBytes!: number;
  @IsString() @MinLength(1) @MaxLength(500) storageKey!: string;
  @IsOptional() @IsEnum(['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']) classification?: 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export class CreateProjectDto {
  @IsString() @MinLength(2) @MaxLength(180) name!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
}

export class UpdateTaskStatusDto {
  @IsEnum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'CANCELLED'])
  status!: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'CANCELLED';
}

export class CreateTaskDto {
  @IsUUID() projectId!: string;
  @IsString() @MinLength(2) @MaxLength(240) title!: string;
  @IsOptional() @IsString() @MaxLength(10000) description?: string;
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  @IsOptional() @IsUUID('4', { each: true }) assigneeIds?: string[];
}

export class CreateApprovalDto {
  @IsString() @MinLength(2) @MaxLength(100) type!: string;
  @IsString() @MinLength(2) @MaxLength(240) title!: string;
  @IsObject()
  payload!: Prisma.JsonObject;
}

export class ApprovalActionDto {
  @IsEnum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']) type!: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  @IsOptional() @IsString() @MaxLength(1000) comment?: string;
}

export class CreateLeaveRequestDto {
  @IsUUID() employeeId!: string;
  @IsString() @MinLength(10) @MaxLength(1000) reason!: string;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
}

export class LeaveDecisionDto {
  @IsEnum(['APPROVED', 'REJECTED', 'CANCELLED']) status!: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  @IsOptional() @IsString() @MaxLength(1000) note?: string;
}

export class SearchQueryDto {
  @IsString() @MinLength(2) @MaxLength(100) q!: string;
  @IsOptional() @IsInt() @Type(() => Number) @Min(1) @Max(100) limit = 20;
}

export class PageQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) pageSize = 20;
}
