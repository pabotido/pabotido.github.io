import { IsIn, IsOptional, IsString, IsUUID, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateArticleDto {
  @IsString() @MinLength(3) @MaxLength(180) title!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(200) slug!: string;
  @IsString() @MinLength(1) @MaxLength(500) summary!: string;
  @IsString() @MinLength(1) @MaxLength(50000) body!: string;
  @IsOptional() @IsIn(['COMPANY', 'DEPARTMENT']) audienceType?: 'COMPANY' | 'DEPARTMENT';
  @IsOptional() @IsUUID() departmentId?: string;
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(180) title?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(500) summary?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50000) body?: string;
  @IsOptional() @IsIn(['COMPANY', 'DEPARTMENT']) audienceType?: 'COMPANY' | 'DEPARTMENT';
  @IsOptional() @IsUUID() departmentId?: string;
}

export class ArticleIdParamDto {
  @IsUUID() id!: string;
}
