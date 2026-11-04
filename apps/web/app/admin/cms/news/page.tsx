'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { approveArticle, CmsArticle, CmsDepartment, CmsTaxonomy, createArticle, getCurrentUser, getDashboard, listCmsCategories, listCmsDepartments, listCmsTags, listManagedArticles, publishArticle, submitArticle } from '../../../../lib/api';
import { PortalShell } from '../../../../components/portal/portal-shell';
import { TaxonomyManager } from '../../../../components/portal/taxonomy-manager';

const statusLabels: Record<CmsArticle['status'], string> = {
  DRAFT: 'Bản nháp', PENDING_REVIEW: 'Chờ duyệt', APPROVED: 'Đã duyệt', PUBLISHED: 'Đã xuất bản', ARCHIVED: 'Đã lưu trữ',
};

function makeSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function ManageNewsPage() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [departments, setDepartments] = useState<CmsDepartment[]>([]);
  const [categories, setCategories] = useState<CmsTaxonomy[]>([]);
  const [tags, setTags] = useState<CmsTaxonomy[]>([]);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState('bạn');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'COMPANY' | 'DEPARTMENT'>('COMPANY');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const user = await getCurrentUser();
      const dashboard = await getDashboard();
      setPermissions(user.permissions);
      setDisplayName(dashboard.user.displayName ?? 'bạn');
      const results = await Promise.all([
        user.permissions.includes('cms.news.read') ? listManagedArticles() : Promise.resolve([]),
        user.permissions.includes('cms.news.create') ? listCmsDepartments() : Promise.resolve([]),
        user.permissions.includes('cms.news.read') ? listCmsCategories() : Promise.resolve([]),
        user.permissions.includes('cms.news.read') ? listCmsTags() : Promise.resolve([]),
      ]);
      setArticles(results[0]);
      setDepartments(results[1]);
      setCategories(results[2]);
      setTags(results[3]);
    } catch (cause) {
      if (cause instanceof Error && cause.message !== 'unauthorized') setError(cause.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function createDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await createArticle({ title, slug: slug || makeSlug(title), summary, body, audienceType: audience, categoryIds, tagIds, ...(audience === 'DEPARTMENT' ? { departmentId } : {}) });
      setTitle(''); setSlug(''); setSlugEdited(false); setSummary(''); setBody(''); setCategoryIds([]); setTagIds([]); setMessage('Đã lưu bản nháp.');
      await load();
    } catch (cause) {
      if (cause instanceof Error) setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: (id: string) => Promise<CmsArticle>, id: string) {
    setError(''); setMessage('');
    try { await action(id); setMessage('Đã cập nhật trạng thái bài viết.'); await load(); }
    catch (cause) { if (cause instanceof Error) setError(cause.message); }
  }

  return <PortalShell displayName={displayName} unavailableModules={[]}>
    <header className="topbar"><div className="breadcrumb"><Link href="/">Không gian doanh nghiệp</Link><strong>/</strong> Quản lý nội dung</div></header>
    <div className="content-wrap">
      <section className="welcome-row"><p className="eyebrow">CMS · TIN TỨC</p><h1>Quản lý bài viết</h1><p className="subheading">Tạo bản nháp, gửi duyệt và xuất bản nội dung nội bộ.</p></section>
      {message && <p className="form-success" role="status">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {loading && <p className="news-state" role="status">Đang tải dữ liệu CMS…</p>}
      {!loading && permissions.includes('cms.taxonomy.manage') && <TaxonomyManager categories={categories} tags={tags} onCategoryCreated={(item) => setCategories((current) => [...current, item].sort((a, b) => a.name.localeCompare(b.name, 'vi')))} onTagCreated={(item) => setTags((current) => [...current, item].sort((a, b) => a.name.localeCompare(b.name, 'vi')))} />}
      {!loading && permissions.includes('cms.news.create') && <form className="panel cms-form" onSubmit={createDraft}>
        <h2>Tạo bài viết</h2>
        <label>Tiêu đề<input required minLength={3} maxLength={180} value={title} onChange={(event) => { setTitle(event.target.value); if (!slugEdited) setSlug(makeSlug(event.target.value)); }} /></label>
        <label>Đường dẫn<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={200} value={slug} onChange={(event) => { setSlug(event.target.value); setSlugEdited(true); }} /></label>
        <label>Tóm tắt<textarea required maxLength={500} rows={2} value={summary} onChange={(event) => setSummary(event.target.value)} /></label>
        <label>Nội dung<textarea required maxLength={50000} rows={8} value={body} onChange={(event) => setBody(event.target.value)} /></label>
        <div className="cms-form-row"><label>Đối tượng<select value={audience} onChange={(event) => setAudience(event.target.value as 'COMPANY' | 'DEPARTMENT')}><option value="COMPANY">Toàn công ty</option><option value="DEPARTMENT">Một phòng ban</option></select></label>
          {audience === 'DEPARTMENT' && <label>Phòng ban<select required value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">Chọn phòng ban</option>{departments.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>}</div>
        <div className="cms-form-row"><label>Danh mục<select multiple value={categoryIds} onChange={(event) => setCategoryIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><small>Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều mục.</small></label>
          <label>Thẻ<select multiple value={tagIds} onChange={(event) => setTagIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{tags.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><small>Giữ Ctrl (Windows) hoặc Command (Mac) để chọn nhiều mục.</small></label></div>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu bản nháp'}</button>
      </form>}
      {!loading && !permissions.includes('cms.news.read') && !permissions.includes('cms.news.create') && <section className="news-state" role="status">Tài khoản của bạn chưa được cấp quyền quản lý nội dung.</section>}
      {!loading && permissions.includes('cms.news.read') && <section className="panel cms-list"><div className="panel-heading"><div><h2>Danh sách bài viết</h2><p>Nội dung và trạng thái biên tập</p></div></div>
        {articles.length === 0 ? <div className="inline-empty">Chưa có bài viết.</div> : <div className="cms-article-list">{articles.map((article) => <article className="cms-article-row" key={article.id}>
          <div><span className={`cms-status status-${article.status.toLowerCase()}`}>{statusLabels[article.status]}</span><h3>{article.title}</h3><p>{article.summary}</p><small>{article.audienceType === 'COMPANY' ? 'Toàn công ty' : article.department?.name} · {article.author.profile?.displayName ?? 'Tác giả'}</small><div className="taxonomy-chips">{article.categories.map(({ category }) => <span key={category.id}>{category.name}</span>)}{article.tags.map(({ tag }) => <span key={tag.id}>#{tag.name}</span>)}</div></div>
          <div className="cms-actions">
            {article.status === 'DRAFT' && permissions.includes('cms.news.update') && <button type="button" onClick={() => void runAction(submitArticle, article.id)}>Gửi duyệt</button>}
            {article.status === 'PENDING_REVIEW' && permissions.includes('cms.news.approve') && <button type="button" onClick={() => void runAction(approveArticle, article.id)}>Duyệt</button>}
            {article.status === 'APPROVED' && permissions.includes('cms.news.publish') && <button type="button" onClick={() => void runAction(publishArticle, article.id)}>Xuất bản</button>}
            {article.status === 'PUBLISHED' && <Link href={`/news?article=${encodeURIComponent(article.slug)}`}>Xem bài</Link>}
          </div>
        </article>)}</div>}
      </section>}
    </div>
  </PortalShell>;
}
