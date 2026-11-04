import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { AuthRequest } from '../auth/auth.types';
import { RequirePermissions } from '../auth/permissions.decorator';
import { PermissionsGuard } from '../auth/permissions.guard';
import { SessionGuard } from '../auth/session.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { ArticleIdParamDto, CreateArticleDto, CreateTaxonomyDto, NewsQueryDto, UpdateArticleDto } from './dto/article.dto';
import { CmsService } from './cms.service';

@ApiTags('cms')
@ApiCookieAuth('portal_session')
@UseGuards(SessionGuard)
@Controller()
export class CmsController {
  constructor(private readonly cms: CmsService) {}

  @Get('news')
  async published(@Query() query: NewsQueryDto, @Req() request: AuthRequest) { return { data: await this.cms.listPublished(request.user!, query), meta: { requestId: 'cms-news-list' } }; }

  @Get('news/categories')
  async publicCategories() { return { data: await this.cms.listCategories(), meta: { requestId: 'news-categories' } }; }

  @Get('news/tags')
  async publicTags() { return { data: await this.cms.listTags(), meta: { requestId: 'news-tags' } }; }

  @Get('news/:slug')
  async publishedBySlug(@Param('slug') slug: string, @Req() request: AuthRequest) { return { data: await this.cms.getPublished(slug, request.user!), meta: { requestId: 'cms-news-detail' } }; }

  @Get('cms/articles')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.news.read')
  async managed() { return { data: await this.cms.listManaged(), meta: { requestId: 'cms-articles-list' } }; }

  @Get('cms/departments')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.news.create')
  async departments() { return { data: await this.cms.listDepartments(), meta: { requestId: 'cms-departments-list' } }; }

  @Get('cms/categories')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.news.read')
  async categories() { return { data: await this.cms.listCategories(), meta: { requestId: 'cms-categories-list' } }; }

  @Post('cms/categories')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.taxonomy.manage')
  async createCategory(@Body() dto: CreateTaxonomyDto) { return { data: await this.cms.createCategory(dto), meta: { requestId: 'cms-category-create' } }; }

  @Get('cms/tags')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('cms.news.read')
  async tags() { return { data: await this.cms.listTags(), meta: { requestId: 'cms-tags-list' } }; }

  @Post('cms/tags')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.taxonomy.manage')
  async createTag(@Body() dto: CreateTaxonomyDto) { return { data: await this.cms.createTag(dto), meta: { requestId: 'cms-tag-create' } }; }

  @Post('cms/articles')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.news.create')
  async create(@Body() dto: CreateArticleDto, @Req() request: AuthRequest) { return { data: await this.cms.create(dto, request.user!), meta: { requestId: 'cms-article-create' } }; }

  @Patch('cms/articles/:id')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.news.update')
  async update(@Param() params: ArticleIdParamDto, @Body() dto: UpdateArticleDto, @Req() request: AuthRequest) { return { data: await this.cms.update(params.id, dto, request.user!), meta: { requestId: 'cms-article-update' } }; }

  @Post('cms/articles/:id/submit')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.news.update')
  async submit(@Param() params: ArticleIdParamDto, @Req() request: AuthRequest) { return { data: await this.cms.submit(params.id, request.user!), meta: { requestId: 'cms-article-submit' } }; }

  @Post('cms/articles/:id/approve')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.news.approve')
  async approve(@Param() params: ArticleIdParamDto, @Req() request: AuthRequest) { return { data: await this.cms.approve(params.id, request.user!), meta: { requestId: 'cms-article-approve' } }; }

  @Post('cms/articles/:id/publish')
  @UseGuards(CsrfGuard, PermissionsGuard)
  @RequirePermissions('cms.news.publish')
  async publish(@Param() params: ArticleIdParamDto, @Req() request: AuthRequest) { return { data: await this.cms.publish(params.id, request.user!), meta: { requestId: 'cms-article-publish' } }; }
}
