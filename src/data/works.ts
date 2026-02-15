import { Work } from '@/types';

export const works: Work[] = [
  {
    title: "オトヨリ",
    description: [
      "コールセンター向けの音声要約Webアプリ",
      "顧客対応の自動解析を実現",
    ],
    techStack: ["SpringBoot", "Gemini API", "Java", "REST API"],
    tags: ["Hackathon"],
    imageUrl: "/images/otoyori.jpg",
  },
  {
    title: "connpass 都道府県別 RSS",
    description: [
      "地方のエンジニア向け勉強会情報を配信",
      "毎日自動で最新情報を取得・配信",
    ],
    techStack: ["Python", "BeautifulSoup4", "GitHub Actions", "RSS"],
    githubUrl: "https://github.com/sin471/connpass-RSS",
    imageUrl: "/images/connpass.png",
  },
];
