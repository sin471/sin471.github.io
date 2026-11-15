import { describe, expect, it } from 'vitest';
import { compareYearMonthDesc, parseYearMonth } from './date';

describe('parseYearMonth', () => {
  it('YYYY/MM をその月の1日として解釈する', () => {
    expect(parseYearMonth('2026/04').toISOString()).toBe('2026-04-01T00:00:00.000Z');
  });

  it('月が1桁でも解釈できる', () => {
    expect(parseYearMonth('2026/4').getTime()).toBe(parseYearMonth('2026/04').getTime());
  });

  it('不正な形式・月は例外を投げる', () => {
    expect(() => parseYearMonth('2026-04')).toThrow();
    expect(() => parseYearMonth('2026/13')).toThrow();
    expect(() => parseYearMonth('')).toThrow();
  });
});

describe('compareYearMonthDesc', () => {
  it('新しい順に並べる', () => {
    const dates = ['2026/4', '2026/08', '2024/12', '2026/10'];
    expect([...dates].sort(compareYearMonthDesc)).toEqual(['2026/10', '2026/08', '2026/4', '2024/12']);
  });
});
