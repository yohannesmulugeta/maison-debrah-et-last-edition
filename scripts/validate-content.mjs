import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))
const productFiles = readdirSync(new URL('../content/products/', import.meta.url)).filter((file) => file.endsWith('.json')).sort()
const products = productFiles.map((file) => readJson(`../content/products/${file}`))
const categories = readJson('../src/data/categories.json')
const site = readJson('../src/data/site.json')
const categoryIds = new Set(categories.map(({ id }) => id))
const ids = new Set()
const slugs = new Set()
const errors = []
const hasText = (value) => typeof value === 'string' && value.trim().length > 0

if (!productFiles.length) errors.push('content/products must contain product JSON files')
else products.forEach((product, index) => {
  const label = productFiles[index]
  if (!product || typeof product !== 'object') {
    errors.push(`${label}: must be an object`)
    return
  }
  if (!Number.isInteger(product.id) || product.id < 1 || ids.has(product.id)) errors.push(`${label}: ID must be a unique positive integer`)
  ids.add(product.id)
  if (!hasText(product.name)) errors.push(`${label}: name is required`)
  if (typeof product.slug !== 'string' || !/^[a-z0-9-]+$/.test(product.slug) || slugs.has(product.slug)) errors.push(`${label}: slug must be unique and URL-safe`)
  slugs.add(product.slug)
  if (!Array.isArray(product.categories) || product.categories.some((category) => !category || !categoryIds.has(category.id))) errors.push(`${label}: category IDs must exist in categories.json`)
  if (!Array.isArray(product.images) || !product.images.length || product.images.some((image) => !image || !hasText(image.src) || !hasText(image.thumbnail))) errors.push(`${label}: at least one image with src and thumbnail is required`)
  if (!Array.isArray(product.attributes)) errors.push(`${label}: attributes must be a list`)
  if (product.price !== null && (typeof product.price !== 'number' || !Number.isFinite(product.price) || product.price < 0)) errors.push(`${label}: price must be blank or a nonnegative number`)
  if (!Number.isInteger(product.shopOrder)) errors.push(`${label}: display order must be a whole number`)
})

if (!site.contact || !/^\d+$/.test(site.contact.whatsappRaw) || !hasText(site.contact.email) || !site.contact.email.includes('@')) errors.push('site.json: contact needs a WhatsApp number and email')
if (!hasText(site.contact?.salesEmail) || !site.contact.salesEmail.includes('@')) errors.push('site.json: sales email is required')
if (!hasText(site.home?.heroTitle)) errors.push('site.json: homepage hero title is required')

if (errors.length) {
  for (const error of errors) console.error(error)
  process.exitCode = 1
} else {
  mkdirSync(new URL('../public/data/', import.meta.url), { recursive: true })
  writeFileSync(new URL('../public/data/products.json', import.meta.url), JSON.stringify(products))
  console.log(`Content valid: ${products.length} products; generated public/data/products.json`)
}
