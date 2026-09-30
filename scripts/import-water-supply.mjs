// Converts the MawaSU2 water supply dictionary (static HTML pages in the
// waterSupply project) into files under public/water-supply/:
//   index.json         headwords of every entry, loaded up front for search
//   detail/<nnn>.json  descriptions and related terms, 100 entry ids per file
//   img/               formula and figure images used in the descriptions
//
// Usage: npm run import:water-supply [-- <path to waterSupply project>]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.resolve(root, process.argv[2] ?? '../waterSupply')
const searchDir = path.join(sourceRoot, 'html', 'search')
const outDir = path.join(root, 'public', 'water-supply')
const outImgDir = path.join(outDir, 'img')

const ALLOWED_TAGS = new Set(['a', 'b', 'i', 'sub', 'sup', 'br', 'img', 'div', 'hr'])

const usedImages = new Set()
const missingImages = new Set()

function readEntryFile(file) {
    const buf = fs.readFileSync(file)
    if (buf[0] === 0xff && buf[1] === 0xfe) return buf.toString('utf16le', 2)
    return buf.toString('utf8').replace(/^﻿/, '')
}

const stripTags = (html) => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

function sanitize(html) {
    return html
        // A few Lao formulas are written as a nested table with a line image
        // as the fraction bar; keep the cell text and draw the bar as <hr>.
        .replace(/<\/?(font|table|tr|td|center)[^>]*>/gi, '')
        .replace(/<img\s+src\s*=\s*"line\.gif"[^>]*>/gi, '<hr class="ws-line">')
        .replace(/<a\s+href\s*=\s*"(\d+)\.html"[^>]*>/gi, '<a href="#ws-$1">')
        .replace(/<a\s(?!href="#ws-)[^>]*>/gi, '<a>')
        .replace(/<img\s+src\s*=\s*"img\/([^"]+)"[^>]*>/gi, (_, name) => {
            const file = name.toLowerCase()
            if (!fs.existsSync(path.join(searchDir, 'img', name))) {
                missingImages.add(name)
                return ''
            }
            usedImages.add(name)
            return `<img src="water-supply/img/${file}" alt="">`
        })
        .replace(/<\/?br\s*\/?>/gi, '<br>')
        .replace(/\s+/g, ' ')
        .trim()
}

// One language block of an entry page: headword row, English row, then
// description rows and an optional "related terms" row (the nowrap label cell).
function parseSection(html) {
    const rows = [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)]
        .map((m) => [...m[1].matchAll(/<td([^>]*)>([\s\S]*?)<\/td>/gi)].map((c) => ({ attrs: c[1], html: c[2] })))
        .filter((cells) => cells.length > 0)
    if (rows.length < 2) return null

    const title = rows[0][0].html
    const titleMatch = title.match(/<b>([\s\S]*?)<\/b>([\s\S]*)/i)
    const head = stripTags(titleMatch ? titleMatch[1] : title)
    const reading = titleMatch ? stripTags(titleMatch[2]).match(/（(.*?)）/)?.[1] ?? '' : ''
    const en = stripTags(rows[1][0].html)

    const desc = []
    let rel = ''
    for (const cells of rows.slice(2)) {
        const labelIndex = cells.findIndex((c) => /nowrap/i.test(c.attrs))
        if (labelIndex !== -1) {
            rel = sanitize(cells.slice(labelIndex + 1).map((c) => c.html).join(' '))
            continue
        }
        const body = sanitize(cells.map((c) => c.html).join(' ')).replace(/^　+/, '')
        if (!body) continue
        const centered = cells.some((c) => /align\s*=\s*"center"/i.test(c.attrs)) || body.includes('<img')
        desc.push(centered ? `<div class="ws-center">${body}</div>` : `<div>${body}</div>`)
    }
    return { head, reading, en, desc: desc.join(''), rel }
}

function parseEntry(id, text) {
    const body = text.slice(text.indexOf('<body'))
    const laoStart = body.search(/<!--\s*Lao language\s*-->/i)
    const laoEnd = body.search(/<!--\s*\/\s*Lao language\s*-->/i)
    const thaiStart = body.search(/<!--\s*Thai language\s*-->/i)
    const thaiEnd = body.search(/<!--\s*\/\s*Thai language\s*-->/i)

    const jaStart = body.indexOf('<table', body.indexOf('titles_yougo'))
    const ja = parseSection(body.slice(jaStart, laoStart === -1 ? undefined : laoStart))
    if (!ja || !ja.head) return null
    const lo = laoStart !== -1 && laoEnd > laoStart ? parseSection(body.slice(laoStart, laoEnd)) : null
    const th = thaiStart !== -1 && thaiEnd > thaiStart ? parseSection(body.slice(thaiStart, thaiEnd)) : null

    const entry = { id, ja: ja.head, kana: ja.reading, en: ja.en, lo: lo?.head ?? '', th: th?.head ?? '', desc: {}, rel: {} }
    for (const [lang, section] of Object.entries({ ja, lo, th })) {
        if (section?.desc) entry.desc[lang] = section.desc
        if (section?.rel) entry.rel[lang] = section.rel
    }
    return entry
}

if (!fs.existsSync(searchDir)) {
    console.error(`Not found: ${searchDir}`)
    process.exit(1)
}

const entries = []
const skipped = []
for (const file of fs.readdirSync(searchDir).filter((f) => /^\d+\.html$/.test(f))) {
    const id = file.replace('.html', '')
    const entry = parseEntry(id, readEntryFile(path.join(searchDir, file)))
    if (entry) entries.push(entry)
    else skipped.push(file)
}

// Drop links to entries that do not exist so they render as plain text.
const ids = new Set(entries.map((e) => e.id))
const unlink = (html) => html.replace(/<a href="#ws-(\d+)">([\s\S]*?)<\/a>/g, (m, id, label) => (ids.has(id) ? m : label))
const leftoverTags = new Set()
for (const entry of entries) {
    for (const group of [entry.desc, entry.rel]) {
        for (const lang of Object.keys(group)) {
            group[lang] = unlink(group[lang])
            for (const m of group[lang].matchAll(/<\/?([a-z0-9]+)/gi)) {
                if (!ALLOWED_TAGS.has(m[1].toLowerCase())) leftoverTags.add(m[1])
            }
        }
    }
}

const collator = new Intl.Collator('ja')
const sortKey = (e) => (e.kana || e.ja).replace(/[()（）]/g, '')
entries.sort((a, b) => collator.compare(sortKey(a), sortKey(b)) || collator.compare(a.ja, b.ja))

const details = {}
for (const { id, desc, rel } of entries) {
    const chunk = id.slice(0, 3)
    details[chunk] ??= {}
    details[chunk][id] = { desc, rel }
}

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outImgDir, { recursive: true })
fs.mkdirSync(path.join(outDir, 'detail'))
fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(entries.map(({ desc, rel, ...head }) => head)))
for (const [chunk, data] of Object.entries(details)) {
    fs.writeFileSync(path.join(outDir, 'detail', `${chunk}.json`), JSON.stringify(data))
}
for (const name of usedImages) {
    fs.copyFileSync(path.join(searchDir, 'img', name), path.join(outImgDir, name.toLowerCase()))
}

const count = (key) => entries.filter((e) => e[key]).length
console.log(`entries: ${entries.length} (lao: ${count('lo')}, thai: ${count('th')})`)
console.log(`images copied: ${usedImages.size}`)
if (missingImages.size) console.log(`missing images (skipped): ${[...missingImages].join(', ')}`)
if (skipped.length) console.log(`unparsed pages (skipped): ${skipped.join(', ')}`)
if (leftoverTags.size) console.log(`unexpected tags: ${[...leftoverTags].join(', ')}`)
