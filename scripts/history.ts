import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parse } from 'yaml'
import type { HistoryEntryData, HistoryManifest } from '../types/history'

export function parseHistoryEntry(source: string, department: string, folderYear: string): HistoryEntryData {
  const file = `${department}/${folderYear}/index.md`
  const frontmatter = source.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

  if (!frontmatter) {
    throw new Error(`${file}: YAML frontmatter is required`)
  }

  let metadata: Record<string, unknown>
  try {
    metadata = parse(frontmatter[1])
  } catch (error) {
    throw new Error(`${file}: invalid YAML frontmatter`, { cause: error })
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    throw new Error(`${file}: frontmatter must be an object`)
  }

  const year = typeof metadata.year === 'number' ? String(metadata.year) : metadata.year
  if (typeof year !== 'string' || !/^\d{4}(?:-\d{4})?$/.test(year) || year.slice(0, 4) !== folderYear) {
    throw new Error(`${file}: year must start with the folder year`)
  }
  if (year.includes('-') && Number(year.slice(5)) < Number(folderYear)) {
    throw new Error(`${file}: year range must be chronological`)
  }
  if (typeof metadata.title !== 'string' || !metadata.title.trim()) {
    throw new Error(`${file}: title is required`)
  }
  if (typeof metadata.description !== 'string' || !metadata.description.trim()) {
    throw new Error(`${file}: description is required`)
  }
  const gallerySlug = metadata['gallery-slug']
  if (gallerySlug != null && (typeof gallerySlug !== 'string' || !gallerySlug.trim())) {
    throw new Error(`${file}: gallery-slug must be a non-empty string`)
  }

  return {
    id: `${department}/${folderYear}`,
    sortYear: Number(folderYear),
    year,
    title: metadata.title.trim(),
    description: { type: 'text', value: metadata.description.trim() },
    ...(typeof gallerySlug === 'string' ? { gallerySlug: gallerySlug.trim() } : {})
  }
}

export async function readHistoryManifest(sourceDir: string): Promise<HistoryManifest> {
  const manifest: HistoryManifest = {}
  const departments = await readdir(sourceDir, { withFileTypes: true })

  for (const department of departments) {
    if (!department.isDirectory() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(department.name)) continue

    const departmentDir = join(sourceDir, department.name)
    const years = await readdir(departmentDir, { withFileTypes: true })
    const entries: HistoryEntryData[] = []

    for (const year of years) {
      if (!year.isDirectory() || !/^\d{4}$/.test(year.name)) continue

      const source = await readFile(join(departmentDir, year.name, 'index.md'), 'utf8')
      entries.push(parseHistoryEntry(source, department.name, year.name))
    }

    manifest[department.name] = {
      department: department.name,
      entries: entries.sort((a, b) => a.sortYear - b.sortYear)
    }
  }

  return manifest
}

export async function generateHistoryManifest(sourceDir: string, outputDir: string) {
  const manifest = await readHistoryManifest(sourceDir)
  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, 'index.json'), JSON.stringify(manifest), 'utf8')
}
