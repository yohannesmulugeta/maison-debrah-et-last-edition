import { readFileSync, writeFileSync } from 'node:fs'

const page = new URL('../dist/index.html', import.meta.url)
const html = readFileSync(page, 'utf8')
const marker = '<meta name="description"'

if (!html.includes(marker)) throw new Error('Preview index is missing its description marker')

writeFileSync(page, html.replace(marker, '<meta name="robots" content="noindex, nofollow" />\n    ' + marker))
