'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { CmsArticle, CmsTaxonomy, getDashboard, getPublishedNews, listPublicCategories, listPublicTags, listPublishedNews, PublishedNewsPage } from '../../lib/api';
import { PortalShell } from '../../components/portal/portal-shell';

const emptyPage: PublishedNewsPage = { items: [], page: 1, pageSize: 20, total: 0 };

export default function NewsPage() {
  const [pageData, setPageData] = useState(emptyPage);
  const [selected, setSelected] = useState<CmsArticle | null>(null);
  const [categories, setCategories] = useState<CmsTaxonomy[]>([]);
  const [tags, setTags] = useState<CmsTaxonomy[]>([]);
  const [detailSlug, setDetailSlug] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('bạn');

  useEffect(() => {
    setDetailSlug(new URLSearchParams(window.location.search).get('article'));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    let active = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [dashboard, categoryItems, tagItems] = await Promise.all([getDashboard(), listPublicCategories(), listPublicTags()]);
        if (!active) return;
        setDisplayName(dashboard.user.displayName ?? 'bạn');
        setCategories(categoryItems);
        setTags(tagItems);
        if (detailSlug) {
          setSelected(await getPublishedNews(detailSlug));
        } else {
          setSelected(null);
          setPageData(await listPublishedNews({ q: appliedQuery, category, tag, page, pageSize: 12 }));
        }
      } catch (cause) {
        if (active && cause instanceof Error && cause.message !== 'unauthorized') setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [initialized, detailSlug, appliedQuery, category, tag, page]);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setAppliedQuery(queryInput.trim());
  }

  const totalPages = Math.max(1, Math.ceil(pageData.total / pageData.pageSize));

  return <PortalShell displayName={displayName} unavailableModules={[]}>
    <header className="topbar"><div className="breadcrumb"><Link href="/">Không gian doanh nghiệp</Link><strong>/</strong> Tin tức</div></header>
    <div className="content-wrap">
      <section className="welcome-row"><p className="eyebrow">CẬP NHẬT NỘI BỘ</p><h1>{selected?.title ?? 'Tin tức & thông báo'}</h1><p className="subheading">Nội dung được xuất bản dành cho bạn.</p></section>
      {selected && <p><Link className="news-back" href="/news">← Tất cả bài viết</Link></p>}
      {!detailSlug && <form className="news-filters panel" onSubmit={search}>
        <label>Tìm kiếm<input type="search" maxLength={100} value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Tìm tiêu đề hoặc nội dung" /></label>
        <label>Danh mục<select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">Tất cả danh mục</option>{categories.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <label>Thẻ<select value={tag} onChange={(event) => { setTag(event.target.value); setPage(1); }}><option value="">Tất cả thẻ</option>{tags.map((item) => <option value={item.slug} key={item.id}>{item.name}</option>)}</select></label>
        <button className="primary-button" type="submit">Tìm</button>
      </form>}
      {loading && <section className="news-state" aria-busy="true" role="status">Đang tải nội dung…</section>}
      {error && <section className="news-state news-error" role="alert"><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Thử lại</button></section>}
      {!loading && !error && selected && <article className="news-article panel">
        <p className="eyebrow">{selected.department?.name ?? 'TOÀN CÔNG TY'}</p>
        <p className="news-byline">{selected.author.profile?.displayName ?? 'Ban biên tập'} · {selected.publishedAt ? new Date(selected.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
        <p className="news-summary">{selected.summary}</p>
        <div className="taxonomy-chips">{selected.categories.map(({ category: item }) => <span key={item.id}>{item.name}</span>)}{selected.tags.map(({ tag: item }) => <span key={item.id}>#{item.name}</span>)}</div>
        <div className="news-body">{selected.body}</div>
      </article>}
      {!loading && !error && !selected && pageData.items.length === 0 && <section className="news-state">Không tìm thấy bài viết phù hợp.</section>}
      {!loading && !error && !selected && pageData.items.length > 0 && <>
        <section className="news-grid" aria-label="Danh sách bài viết">
          {pageData.items.map((article) => <article className="news-card panel" key={article.id}>
            <p className="eyebrow">{article.department?.name ?? 'TOÀN CÔNG TY'}</p>
            <h2><a href={`/news?article=${encodeURIComponent(article.slug)}`}>{article.title}</a></h2>
            <p>{article.summary}</p>
            <div className="taxonomy-chips">{article.categories.map(({ category: item }) => <span key={item.id}>{item.name}</span>)}{article.tags.map(({ tag: item }) => <span key={item.id}>#{item.name}</span>)}</div>
            <div className="news-card-footer"><span>{article.author.profile?.displayName ?? 'Ban biên tập'}</span><a href={`/news?article=${encodeURIComponent(article.slug)}`}>Đọc bài →</a></div>
          </article>)}
        </section>
        <nav className="pagination" aria-label="Phân trang tin tức"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>← Trước</button><span>Trang {page} / {totalPages} · {pageData.total} bài viết</span><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>Sau →</button></nav>
      </>}
    </div>
  </PortalShell>;
}
