// Text normalization shared by the search box of every tab.

// The water supply dictionary uses older kanji (沈澱, 濾過, 攪拌, 曝気, 管渠);
// match the everyday spellings too (沈殿, ろ過, 撹拌, ばっ気, 管きょ).
const KANJI_VARIANTS = { 澱: '殿', 濾: 'ろ', 攪: '撹', 曝: 'ばっ', 渠: 'きょ' }

// Lowercase, turn katakana into hiragana ("スイアツ" finds "すいあつ") and unify kanji variants.
export function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
        .replace(/[澱濾攪曝渠]/g, (c) => KANJI_VARIANTS[c])
}
