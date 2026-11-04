'use client';

import { FormEvent, useState } from 'react';
import { CmsTaxonomy, createCmsCategory, createCmsTag } from '../../lib/api';

function slugify(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type TaxonomyManagerProps = {
  categories: CmsTaxonomy[];
  tags: CmsTaxonomy[];
  onCategoryCreated: (item: CmsTaxonomy) => void;
  onTagCreated: (item: CmsTaxonomy) => void;
};

export function TaxonomyManager({ categories, tags, onCategoryCreated, onTagCreated }: TaxonomyManagerProps) {
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categorySlugEdited, setCategorySlugEdited] = useState(false);
  const [tagName, setTagName] = useState('');
  const [tagSlug, setTagSlug] = useState('');
  const [tagSlugEdited, setTagSlugEdited] = useState(false);
  const [error, setError] = useState('');

  async function create(event: FormEvent<HTMLFormElement>, kind: 'category' | 'tag') {
    event.preventDefault();
    const name = kind === 'category' ? categoryName : tagName;
    const slug = (kind === 'category' ? categorySlug : tagSlug) || slugify(name);
    setError('');
    try {
      const item = kind === 'category' ? await createCmsCategory({ name, slug }) : await createCmsTag({ name, slug });
      if (kind === 'category') { onCategoryCreated(item); setCategoryName(''); setCategorySlug(''); setCategorySlugEdited(false); }
      else { onTagCreated(item); setTagName(''); setTagSlug(''); setTagSlugEdited(false); }
    } catch (cause) {
      if (cause instanceof Error) setError(cause.message);
    }
  }

  return <section className="panel taxonomy-panel" aria-labelledby="taxonomy-title">
    <div className="panel-heading"><div><h2 id="taxonomy-title">Categories & tags</h2><p>{categories.length} danh mục · {tags.length} thẻ</p></div></div>
    <div className="taxonomy-forms">
      <form onSubmit={(event) => void create(event, 'category')}>
        <label>Danh mục<input required minLength={2} maxLength={100} value={categoryName} onChange={(event) => { setCategoryName(event.target.value); if (!categorySlugEdited) setCategorySlug(slugify(event.target.value)); }} placeholder="Ví dụ: Nhân sự" /></label>
        <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} value={categorySlug} onChange={(event) => { setCategorySlug(event.target.value); setCategorySlugEdited(true); }} /></label>
        <button type="submit">Thêm danh mục</button>
      </form>
      <form onSubmit={(event) => void create(event, 'tag')}>
        <label>Thẻ<input required minLength={2} maxLength={100} value={tagName} onChange={(event) => { setTagName(event.target.value); if (!tagSlugEdited) setTagSlug(slugify(event.target.value)); }} placeholder="Ví dụ: Chính sách" /></label>
        <label>Slug<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={100} value={tagSlug} onChange={(event) => { setTagSlug(event.target.value); setTagSlugEdited(true); }} /></label>
        <button type="submit">Thêm thẻ</button>
      </form>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
