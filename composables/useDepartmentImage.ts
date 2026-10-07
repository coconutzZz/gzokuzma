// List existing files at build time so missing logos are never requested.
const departmentImages = new Set(Object.keys(import.meta.glob('/public/img/*.png')))

export function useDepartmentImage() {
  return (slug?: string | null) => {
    return slug && departmentImages.has(`/public/img/${slug}.png`)
      ? `/img/${slug}.png`
      : '/img/pgddefault.png'
  }
}
