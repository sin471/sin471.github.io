/**
 * キー入力列の中から特定のシーケンス（コナミコマンド等）を検出する。
 * 途中で間違えても、その時点までの入力の末尾がシーケンスの先頭と一致していれば継続する。
 */
export function createSequenceMatcher(sequence: readonly string[], onMatch: () => void) {
  const target = sequence.map((k) => k.toLowerCase())
  let buffer: string[] = []

  return {
    push(key: string): boolean {
      buffer.push(key.toLowerCase())
      if (buffer.length > target.length) buffer = buffer.slice(-target.length)
      const matched =
        buffer.length === target.length && buffer.every((k, i) => k === target[i])
      if (matched) {
        buffer = []
        onMatch()
      }
      return matched
    },
    reset(): void {
      buffer = []
    },
  }
}

export const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a',
] as const
