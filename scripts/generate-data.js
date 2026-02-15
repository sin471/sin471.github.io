const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const contentDir = path.join(__dirname, '../content');
const dataDir = path.join(__dirname, '../src/data');

/**
 * Markdown本文を配列に変換（箇条書き用）
 */
function contentToArray(content) {
  return content
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.trim().replace(/^-\s*/, ''));
}

/**
 * ディレクトリ内の全Markdownファイルを読み込み
 */
function loadMarkdownFiles(directory) {
  const fullPath = path.join(contentDir, directory);
  
  if (!fs.existsSync(fullPath)) {
    return [];
  }
  
  const files = fs.readdirSync(fullPath)
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const filePath = path.join(fullPath, file);
      const fileContents = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(fileContents);
      return { ...data, content: content.trim() };
    });
  
  // orderフィールドがあればソート
  return files.sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    return 0;
  });
}

/**
 * 単一のMarkdownファイルを読み込み
 */
function loadSingleMarkdown(fileName) {
  const filePath = path.join(contentDir, fileName);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  return data;
}

// Works
console.log('Generating works.ts...');
const works = loadMarkdownFiles('works').map(item => ({
  title: item.title,
  description: contentToArray(item.content),
  techStack: item.techStack,
  tags: item.tags,
  githubUrl: item.githubUrl,
  imageUrl: item.imageUrl,
}));

fs.writeFileSync(
  path.join(dataDir, 'works.ts'),
  `import { Work } from '@/types';\n\nexport const works: Work[] = ${JSON.stringify(works, null, 2)};\n`
);

// Activities
console.log('Generating activities.ts...');
const activities = loadMarkdownFiles('activities').map(item => ({
  title: item.title,
  subtitle: item.subtitle,
  description: contentToArray(item.content),
  highlight: item.highlight,
  highlightColor: item.highlightColor,
  imageUrl: item.imageUrl,
  externalUrl: item.externalUrl,
}));

fs.writeFileSync(
  path.join(dataDir, 'activities.ts'),
  `import { Activity } from '@/types';\n\nexport const activities: Activity[] = ${JSON.stringify(activities, null, 2)};\n`
);

// Skills
console.log('Generating skills.ts...');
const skills = loadMarkdownFiles('skills').map(item => ({
  name: item.name,
  icon: item.icon,
  detail: item.content.trim(),
  level: item.level,
  years: item.years,
}));

fs.writeFileSync(
  path.join(dataDir, 'skills.ts'),
  `import { Skill } from '@/types';\n\nexport const skillStack: Skill[] = ${JSON.stringify(skills, null, 2)};\n`
);

// Accounts
console.log('Generating accounts.ts...');
const accountsData = loadSingleMarkdown('accounts.md');

fs.writeFileSync(
  path.join(dataDir, 'accounts.ts'),
  `import { AccountLink } from '@/types';\n\nexport const accountLinks: AccountLink[] = ${JSON.stringify(accountsData.accounts, null, 2)};\n`
);

// Academic
console.log('Generating academic.ts...');
const academicData = loadSingleMarkdown('academic.md');

fs.writeFileSync(
  path.join(dataDir, 'academic.ts'),
  `import { AcademicInfo } from '@/types';\n\nexport const academicHistory: AcademicInfo[] = ${JSON.stringify(academicData.academic, null, 2)};\n`
);

// Career
console.log('Generating career.ts...');
const careerData = loadSingleMarkdown('career.md');

fs.writeFileSync(
  path.join(dataDir, 'career.ts'),
  `import { CareerInfo } from '@/types';\n\nexport const careerHistory: CareerInfo[] = ${JSON.stringify(careerData.career, null, 2)};\n`
);

// Achievements
console.log('Generating achievements.ts...');
const achievements = loadMarkdownFiles('achievements').map(item => ({
  title: item.title,
  description: item.content.trim(),
  date: item.date,
  url: item.url,
}));

fs.writeFileSync(
  path.join(dataDir, 'achievements.ts'),
  `import { Achievement } from '@/types';\n\nexport const achievements: Achievement[] = ${JSON.stringify(achievements, null, 2)};\n`
);

// Certifications
console.log('Generating certifications.ts...');
const certificationsData = loadSingleMarkdown('certifications.md');

fs.writeFileSync(
  path.join(dataDir, 'certifications.ts'),
  `export interface Certification {\n  name: string;\n}\n\nexport const certifications: Certification[] = ${JSON.stringify(certificationsData.certifications, null, 2)};\n`
);

console.log('✓ All data files generated successfully!');
