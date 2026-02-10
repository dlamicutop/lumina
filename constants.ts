
import { Folder, Tag, Bookmark } from './types';

export const INITIAL_FOLDERS: Folder[] = [
  { id: 'all', name: '我的书签', icon: 'folder_open', count: 6 },
  { id: 'work', name: '工作项目', icon: 'work', count: 0, parentId: 'all' },
  { id: 'tech', name: '技术文档', icon: 'code', count: 4, parentId: 'all' },
  { id: 'reading', name: '阅读清单', icon: 'menu_book', count: 2, parentId: 'all' },
  { id: 'course', name: '在线课程', icon: 'school', count: 0, parentId: 'all' },
];

export const INITIAL_TAGS: Tag[] = [
  { id: '1', name: '开发', color: 'blue', count: 4 },
  { id: '2', name: '设计', color: 'purple', count: 2 },
  { id: '3', name: 'CSS', color: 'cyan', count: 2 },
  { id: '4', name: 'JavaScript', color: 'amber', count: 1 },
  { id: '5', name: 'TS', color: 'blue', count: 1 },
  { id: '6', name: '工具', color: 'slate', count: 1 },
  { id: '7', name: '资源', color: 'green', count: 1 },
  { id: '8', name: 'UI组件', color: 'pink', count: 0 },
  { id: '9', name: '待阅读', color: 'indigo', count: 0 },
  { id: '10', name: '生产力', color: 'orange', count: 0 },
];

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: 'b1',
    title: 'Tailwind CSS Documentation',
    url: 'https://tailwindcss.com',
    description: 'Rapidly build modern websites without ever leaving your HTML. A utility-first CSS framework.',
    folderId: 'tech',
    tags: ['开发', 'CSS'],
    createdAt: '2小时前',
    createdAtTimestamp: now - 2 * 60 * 60 * 1000,
    visitCount: 15,
    lastVisited: now - 10000,
    favicon: 'https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=128',
    content: '# 学习笔记\n\nTailwind 的核心优势在于 **Utility-first**。\n\n## 常用类名\n- `flex`: 弹性布局\n- `grid`: 网格布局\n- `text-slate-500`: 颜色\n\n> 记住：不要硬编码样式，尽量使用配置表。'
  },
  {
    id: 'b2',
    title: 'React Documentation',
    url: 'https://react.dev',
    description: 'The new way to learn React with interactive examples and deep dives into concepts.',
    folderId: 'tech',
    tags: ['开发', 'JavaScript'],
    createdAt: '昨天',
    createdAtTimestamp: now - day,
    visitCount: 42,
    lastVisited: now - 5000, // Most recent
    favicon: 'https://www.google.com/s2/favicons?domain=react.dev&sz=128',
    content: '# React 19 新特性\n\n- Server Components\n- Actions\n- New Hooks: `useFormStatus`'
  },
  {
    id: 'b3',
    title: 'Coolors.co',
    url: 'https://coolors.co',
    description: 'The super fast color palettes generator! Create the perfect matching colors in seconds.',
    folderId: 'reading',
    tags: ['设计', '工具'],
    createdAt: '3天前',
    createdAtTimestamp: now - 3 * day,
    visitCount: 5,
    lastVisited: now - 5 * day,
    favicon: 'https://www.google.com/s2/favicons?domain=coolors.co&sz=128'
  },
  {
    id: 'b4',
    title: 'A Complete Guide to Flexbox',
    url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    description: 'Our comprehensive guide to CSS flexbox layout. This complete guide explains everything about flexbox.',
    folderId: 'tech',
    tags: ['开发', 'CSS'],
    createdAt: '1周前',
    createdAtTimestamp: now - 7 * day,
    visitCount: 8,
    lastVisited: now - 2 * day,
    favicon: 'https://www.google.com/s2/favicons?domain=css-tricks.com&sz=128'
  },
  {
    id: 'b5',
    title: 'TypeScript Handbook',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    description: 'TypeScript is JavaScript with syntax for types. Documentation for v4.x.',
    folderId: 'tech',
    tags: ['开发', 'TS'],
    createdAt: '2周前',
    createdAtTimestamp: now - 14 * day,
    visitCount: 20,
    lastVisited: now - day,
    favicon: 'https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=128'
  },
  {
    id: 'b6',
    title: 'Figma',
    url: 'https://figma.com',
    description: 'Best community resources for UI design. Systems and templates for faster workflows.',
    folderId: 'reading',
    tags: ['设计', '资源'],
    createdAt: '1个月前',
    createdAtTimestamp: now - 30 * day,
    visitCount: 3,
    lastVisited: now - 20 * day,
    favicon: 'https://www.google.com/s2/favicons?domain=figma.com&sz=128'
  }
];

export const TAG_COLORS: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-800' },
  purple: { bg: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-800' },
  green: { bg: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', border: 'border-green-100 dark:border-green-800' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-100 dark:border-orange-800' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', border: 'border-red-100 dark:border-red-800' },
  indigo: { bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-100 dark:border-indigo-800' },
  pink: { bg: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-100 dark:border-pink-800' },
  cyan: { bg: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-100 dark:border-cyan-800' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-800' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-900/30', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-100 dark:border-slate-800' },
};
