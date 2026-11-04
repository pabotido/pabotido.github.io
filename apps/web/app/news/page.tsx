'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CmsArticle, getDashboard, getPublishedNews, listPublishedNews } from '../../lib/api';
import { PortalShell } from '../../components/portal/portal-shell';

export default function NewsPage() {
  const [articles, setArticles] = useState<CmsArticle[]>([]);
  const [selected, setSelected] = useState<CmsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('bạn');

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('article');
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const dashboard = await getDashboard();
        setDisplayName(dashboard.user.displayName ?? 'bạn');
        if (slug) setSelected(await getPublishedNews(slug));
        else setArticles(await listPublishedNews());
      } catch (cause) {
        if (cause instanceof Error && cause.message !== 'unauthorized') setError(cause.message);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return <PortalShell displayName={displayName} unavailableModules={[]}>
    <header className="topbar"><div className="breadcrumb"><Link href="/">Không gian doanh nghiệp</Link><strong>/</strong> Tin tức</div></header>
    <div className="content-wrap">
      <section className="welcome-row"><p className="eyebrow">CẬP NHẬT NỘI BỘ</p><h1>{selected?.title ?? 'Tin tức & thông báo'}</h1><p className="subheading">Nội dung được xuất bản dành cho bạn.</p></section>
      {selected && <p><Link className="news-back" href="/news">← Tất cả bài viết</Link></p>}
      {loading && <section className="news-state" aria-busy="true" role="status">Đang tải nội dung…</section>}
      {error && <section className="news-state news-error" role="alert"><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Thử lại</button></section>}
      {!loading && !error && selected && <article className="news-article panel">
        <p className="eyebrow">{selected.department?.name ?? 'TOÀN CÔNG TY'}</p>
        <p className="news-byline">{selected.author.profile?.displayName ?? 'Ban biên tập'} · {selected.publishedAt ? new Date(selected.publishedAt).toLocaleDateString('vi-VN') : ''}</p>
        <p className="news-summary">{selected.summary}</p>
        <div className="news-body">{selected.body}</div>
      </article>}
      {!loading && !error && !selected && articles.length === 0 && <section className="news-state">Chưa có bài viết được xuất bản cho bạn.</section>}
      {!loading && !error && !selected && articles.length > 0 && <section className="news-grid" aria-label="Danh sách bài viết">
        {articles.map((article) => <article className="news-card panel" key={article.id}>
          <p className="eyebrow">{article.department?.name ?? 'TOÀN CÔNG TY'}</p>
          <h2><a href={`/news?article=${encodeURIComponent(article.slug)}`}>{article.title}</a></h2>
          <p>{article.summary}</p>
          <div className="news-card-footer"><span>{article.author.profile?.displayName ?? 'Ban biên tập'}</span><a href={`/news?article=${encodeURIComponent(article.slug)}`}>Đọc bài →</a></div>
        </article>)}
      </section>}
    </div>
  </PortalShell>;
}
