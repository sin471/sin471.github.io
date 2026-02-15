import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content');

/**
 * 指定されたディレクトリ内の全Markdownファイルを取得
 */
export function getMarkdownFiles(directory: string): string[] {
  const fullPath = path.join(contentDirectory, directory);
  
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  
  return fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(fullPath, file));
}

/**
 * Markdownファイルを解析してデータを取得
 */
export function parseMarkdownFile<T>(filePath: string): T & { content: string } {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    ...data,
    content: content.trim(),
  } as T & { content: string };
}

/**
 * Markdown本文を配列に変換（箇条書き用）
 */
export function contentToArray(content: string): string[] {
  return content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().replace(/^-\s*/, ''));
}

/**
 * 単一のMarkdownファイルからデータを取得
 */
export function getSingleMarkdownData<T>(fileName: string): T & { content: string } {
  const filePath = path.join(contentDirectory, fileName);
  return parseMarkdownFile<T>(filePath);
}

/**
 * ディレクトリ内の全Markdownファイルからデータ配列を取得
 */
export function getMarkdownDataArray<T>(directory: string): (T & { content: string })[] {
  const files = getMarkdownFiles(directory);
  const data = files.map(file => parseMarkdownFile<T>(file));
  
  // orderフィールドがあればソート
  return data.sort((a: any, b: any) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });
}
