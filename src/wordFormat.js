// Splits a word-list line like "景観（けいかん）　ທັດສະນີຍະພາບ" into parts for display.

const LAO = /[຀-໿]/
// A reading is a full-width parenthesis that contains hiragana: （けいかん）
const READING = /（[^（）]*[ぁ-ゖ][^（）]*）/g

// [{ text, reading }] so readings can be shown smaller without v-html
function segments(text) {
    const parts = []
    let last = 0
    for (const m of text.matchAll(READING)) {
        if (m.index > last) parts.push({ text: text.slice(last, m.index), reading: false })
        parts.push({ text: m[0], reading: true })
        last = m.index + m[0].length
    }
    if (last < text.length) parts.push({ text: text.slice(last), reading: false })
    return parts
}

// { heading, jp, meaning }: jp is the Japanese part (before the first Lao
// character), meaning is the rest (Lao, English, notes). Lines starting with
// "・" are section headings.
export function parseWord(text) {
    const heading = text.startsWith('・')
    const body = heading ? text.slice(1) : text
    const laoAt = body.search(LAO)
    const jp = laoAt === -1 ? body : body.slice(0, laoAt)
    const meaning = laoAt === -1 ? '' : body.slice(laoAt)
    return { heading, jp: segments(jp.trim()), meaning: segments(meaning.trim()) }
}
