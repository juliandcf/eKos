import { WordToken } from '../types/teleprompter';

/**
 * Normalizes a word for comparison:
 * 1. Lowercase
 * 2. Strip diacritics / accents (á->a, é->e, etc.)
 * 3. Remove non-alphanumeric characters (keep letters & numbers)
 */
export function normalizeWord(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accent marks
    .replace(/[^a-z0-9]/g, '');      // strip punctuation, hyphens, symbols
}

/**
 * Converts a string into a simplified phonetic representation
 * particularly optimized for Spanish & Latin speech recognition quirks:
 * - v and b are identical in Spanish phonetics
 * - c (before e/i), z, and s sound identical in Latin America and fast singing
 * - y and ll sound identical (yeísmo)
 * - h is silent
 * - qu and c before a/o/u sound like k
 */
export function phoneticNormalize(cleanWord: string): string {
  if (!cleanWord) return '';
  return cleanWord
    .replace(/v/g, 'b')
    .replace(/z/g, 's')
    .replace(/c(?=[ei])/g, 's')
    .replace(/qu/g, 'k')
    .replace(/c/g, 'k')
    .replace(/ll/g, 'y')
    .replace(/h/g, '')
    .replace(/(.)\1+/g, '$1'); // collapse double consonants like rr -> r, bb -> b
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Determines whether a spoken word matches an expected song token
 * using multi-tier fuzzy matching with high precision.
 */
export function isWordMatch(spokenRaw: string, targetClean: string): boolean {
  const spokenClean = normalizeWord(spokenRaw);
  if (!spokenClean || !targetClean) return false;

  // 1. Exact match after cleaning
  if (spokenClean === targetClean) return true;

  // 2. Numbers / Digits equivalence (e.g. "uno" -> "1", "dos" -> "2")
  const numberWords: Record<string, string> = {
    '1': 'uno', '2': 'dos', '3': 'tres', '4': 'cuatro', '5': 'cinco',
    '6': 'seis', '7': 'siete', '8': 'ocho', '9': 'nueve', '10': 'diez',
    'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5'
  };
  if (numberWords[spokenClean] === targetClean || numberWords[targetClean] === spokenClean) {
    return true;
  }

  // Very short words (1-2 chars, e.g. "a", "el", "de", "un") require exact match
  // to avoid false positives with filler syllables
  if (targetClean.length <= 2) {
    return spokenClean === targetClean;
  }

  // 3. Phonetic match (Spanish dialectal/yeismo/seseo/b-v normalization)
  const spokenPhonetic = phoneticNormalize(spokenClean);
  const targetPhonetic = phoneticNormalize(targetClean);
  if (spokenPhonetic === targetPhonetic && spokenPhonetic.length >= 3) {
    return true;
  }

  // 4. Prefix stem matching for singing/vibrato (length >= 4 and match >= 75% of length)
  if (targetClean.length >= 4) {
    if (spokenClean.startsWith(targetClean) || targetClean.startsWith(spokenClean)) {
      const minLen = Math.min(spokenClean.length, targetClean.length);
      const maxLen = Math.max(spokenClean.length, targetClean.length);
      if (minLen / maxLen >= 0.7) return true;
    }
  }

  // 5. Levenshtein edit distance with strict thresholds based on length
  const dist = levenshteinDistance(spokenClean, targetClean);
  if (targetClean.length >= 4 && dist <= 1) {
    return true;
  }
  if (targetClean.length >= 7 && dist <= 2) {
    return true;
  }

  // Check distance on phonetic versions as well
  const phoneticDist = levenshteinDistance(spokenPhonetic, targetPhonetic);
  if (targetPhonetic.length >= 4 && phoneticDist <= 1) {
    return true;
  }

  return false;
}

/**
 * Tokenizes raw song/teleprompter text into a flat list of WordToken objects
 * preserving line breaks and paragraph breaks for faithful display.
 */
export function tokenizeText(rawText: string): WordToken[] {
  if (!rawText) return [];

  const tokens: WordToken[] = [];
  const paragraphs = rawText.split(/\r?\n\r?\n/);
  let globalId = 0;

  paragraphs.forEach((paragraph, pIdx) => {
    const lines = paragraph.split(/\r?\n/);

    lines.forEach((line, lIdx) => {
      const words = line.trim().split(/\s+/).filter(Boolean);

      words.forEach((word, wIdx) => {
        const isLastInLine = wIdx === words.length - 1;
        const isLastInParagraph = isLastInLine && lIdx === lines.length - 1;

        tokens.push({
          id: globalId++,
          original: word,
          clean: normalizeWord(word),
          hasTrailingSpace: !isLastInLine,
          isLineBreak: isLastInLine && !isLastInParagraph,
          isParagraphBreak: isLastInParagraph && pIdx < paragraphs.length - 1,
        });
      });
    });
  });

  return tokens;
}

/**
 * Forward lookahead window search algorithm.
 * Searches the upcoming tokens from `cursorIndex` up to `cursorIndex + lookaheadWindow`.
 * If any spoken word matches a target token, it returns the target token index.
 */
export function findMatchInLookahead(
  spokenWords: string[],
  tokens: WordToken[],
  cursorIndex: number,
  lookaheadWindow: number = 4
): number | null {
  if (cursorIndex >= tokens.length || spokenWords.length === 0) {
    return null;
  }

  const maxIndex = Math.min(tokens.length - 1, cursorIndex + lookaheadWindow);

  // We search for each spoken word against our forward window.
  // We prefer matches closer to cursorIndex first.
  for (let offset = 0; offset <= (maxIndex - cursorIndex); offset++) {
    const targetIdx = cursorIndex + offset;
    const targetToken = tokens[targetIdx];

    for (const spokenWord of spokenWords) {
      if (isWordMatch(spokenWord, targetToken.clean)) {
        return targetIdx;
      }
    }
  }

  return null;
}
