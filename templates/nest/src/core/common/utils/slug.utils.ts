export function createSlug(title: string): string {
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-$/, '');
  }

  return slug;
}
