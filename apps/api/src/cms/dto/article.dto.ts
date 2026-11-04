import { ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsInt, IsOptional, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @IsString() @MinLength(3) @MaxLength(180) title!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(200) slug!: string;
  @IsString() @MinLength(1) @MaxLength(500) summary!: string;
  @IsString() @MinLength(1) @MaxLength(50000) body!: string;
  @IsOptional() @IsIn(['COMPANY', 'DEPARTMENT']) audienceType?: 'COMPANY' | 'DEPARTMENT';
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsUUID('4', { each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ArrayUnique() @IsUUID('4', { each: true }) tagIds?: string[];
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @MinLength(3) @MaxLength(180) title?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(200) slug?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(500) summary?: string;
  @IsOptional() @IsString() @MinLength(1) @MaxLength(50000) body?: string;
  @IsOptional() @IsIn(['COMPANY', 'DEPARTMENT']) audienceType?: 'COMPANY' | 'DEPARTMENT';
  @IsOptional() @IsUUID() departmentId?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ArrayUnique() @IsUUID('4', { each: true }) categoryIds?: string[];
  @IsOptional() @IsArray() @ArrayMaxSize(30) @ArrayUnique() @IsUUID('4', { each: true }) tagIds?: string[];
}

export class CreateTaxonomyDto {
  @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) @MaxLength(120) slug!: string;
}

export class NewsQueryDto {
  @IsOptional() @IsString() @MinLength(1) @MaxLength(100) q?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) category?: string;
  @IsOptional() @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) tag?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) pageSize = 20;
}

export class ArticleIdParamDto {
  @IsUUID() id!: string;
}
