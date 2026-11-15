/**
 * "YYYY/MM" 形式の文字列を Date に変換する（その月の1日, UTC）。
 * 形式が不正な場合はビルド時に気付けるよう例外を投げる。
 */
export function parseYearMonth(value: string): Date {
  const match = /^(\d{4})\/(\d{1,2})$/.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid date format (expected YYYY/MM): "${value}"`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) {
    throw new Error(`Invalid month in date: "${value}"`);
  }
  return new Date(Date.UTC(year, month - 1, 1));
}

/** 新しい日付が先に来るように比較する */
export function compareYearMonthDesc(a: string, b: string): number {
  return parseYearMonth(b).getTime() - parseYearMonth(a).getTime();
}
