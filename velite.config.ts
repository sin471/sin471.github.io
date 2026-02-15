import { defineCollection, defineConfig, s } from 'velite'

// Works collection
const works = defineCollection({
  name: 'Work',
  pattern: 'works/**/*.md',
  schema: s
    .object({
      title: s.string(),
      tags: s.array(s.string()).optional(),
      techStack: s.array(s.string()),
      githubUrl: s.string().optional(),
      imageUrl: s.string().optional(),
      order: s.number(),
      body: s.raw(),
    })
    .transform((data) => ({
      ...data,
      description: data.body.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-\s*/, '')),
    })),
})

// Activities collection
const activities = defineCollection({
  name: 'Activity',
  pattern: 'activities/**/*.md',
  schema: s
    .object({
      title: s.string(),
      subtitle: s.string().optional(),
      highlight: s.boolean().optional(),
      highlightColor: s.string().optional(),
      imageUrl: s.string().optional(),
      externalUrl: s.string().optional(),
      order: s.number(),
      body: s.raw(),
    })
    .transform((data) => ({
      ...data,
      description: data.body.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.trim().replace(/^-\s*/, '')),
    })),
})

// Skills collection
const skills = defineCollection({
  name: 'Skill',
  pattern: 'skills/**/*.md',
  schema: s
    .object({
      name: s.string(),
      icon: s.string(),
      level: s.number().refine((val) => val >= 1 && val <= 3),
      years: s.string(),
      body: s.raw(),
    })
    .transform((data) => ({
      ...data,
      detail: data.body.trim(),
    })),
})

// Achievements collection
const achievements = defineCollection({
  name: 'Achievement',
  pattern: 'achievements/**/*.md',
  schema: s
    .object({
      title: s.string(),
      date: s.string().optional(),
      url: s.string().optional(),
      order: s.number(),
      body: s.raw(),
    })
    .transform((data) => ({
      ...data,
      description: data.body.trim(),
    })),
})

// Single files (accounts, academic, career, certifications)
const accounts = defineCollection({
  name: 'Accounts',
  pattern: 'accounts.md',
  single: true,
  schema: s.object({
    accounts: s.array(
      s.object({
        name: s.string(),
        url: s.string(),
        icon: s.string(),
      })
    ),
  }),
})

const academic = defineCollection({
  name: 'Academic',
  pattern: 'academic.md',
  single: true,
  schema: s.object({
    academic: s.array(
      s.object({
        period: s.string(),
        institution: s.string(),
        description: s.string(),
      })
    ),
  }),
})

const career = defineCollection({
  name: 'Career',
  pattern: 'career.md',
  single: true,
  schema: s.object({
    career: s.array(
      s.object({
        period: s.string(),
        institution: s.string(),
        description: s.string(),
      })
    ),
  }),
})

const certifications = defineCollection({
  name: 'Certifications',
  pattern: 'certifications.md',
  single: true,
  schema: s.object({
    certifications: s.array(
      s.object({
        name: s.string(),
      })
    ),
  }),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: {
    works,
    activities,
    skills,
    achievements,
    accounts,
    academic,
    career,
    certifications,
  },
  markdown: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
})
