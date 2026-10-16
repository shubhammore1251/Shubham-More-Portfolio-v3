// All visible portfolio content lives here. Items marked "PLACEHOLDER" should be
// replaced with real details. Future live data must keep these same shapes.
import avatar from "@/assets/avatar.png";
import projectAi from "@/assets/project-ai.jpg";
import projectMobile from "@/assets/project-mobile.jpg";
import projectBuildlyio from "@/assets/buildlyio.jpg";
import projectMuseAgent from "@/assets/muse-ai-clone.png";
import blog1 from "@/assets/blog-1.jpg";
import type {
  PortfolioBlogPost,
  PortfolioExperience,
  PortfolioProfile,
  PortfolioProject,
  SkillCategoryData,
  TechnologyItem,
} from "./types";

export const profile: PortfolioProfile = {
  fullName: "Shubham More",
  role: "Full-Stack Software Engineer",
  headline: "I build thoughtful software, from first commit to production.",
  introduction:
    "From web and mobile apps to backend systems and AI-powered products, I turn ideas into reliable software built for real-world use.",
  location: "India",
  email: "shubhamp1251@gmail.com",
  github_url: "https://github.com/shubhammore1251",
  linkedinUrl: "https://www.linkedin.com/in/shubham-more1251/",
  resumeUrl:
    "https://drive.google.com/drive/folders/1TwfYL1Ydyg4zCiiTSEKKfASLb54f8T8a",
  avatarUrl: avatar,
  availabilityLabel: "Open to new opportunities",
};

export const hashnodeUrl = "https://hashnode.com/@shubham1251";

export const about = {
  heading: "Engineer by craft. Builder by curiosity.",
  paragraphs: [
    "I'm a full-stack engineer who enjoys turning ideas into working software — from shaping the first concept and choosing the right tools to shipping and maintaining the finished product.",
    "I’m drawn to problems at the intersection of product and engineering: understanding what users need, then building reliable systems that are clear, useful, and easy to maintain.",
  ],
  principles: [
    {
      title: "Clarity over cleverness",
      body: "Readable code and simple infrastructure stand the test of time.",
    },
    {
      title: "Ship, then sharpen",
      body: "Get useful software into users’ hands, then improve it with purpose.",
    },
    {
      title: "Own the outcome",
      body: "I care about the whole journey, from data models to deployment.",
    },
  ],
};

const t = (
  id: string,
  name: string,
  category: string,
  iconifyIcon: string | null,
  featured = false,
  sortOrder = 0,
  iconColor?: string,
): TechnologyItem => ({
  id,
  name,
  category,
  iconifyIcon,
  featured,
  sortOrder,
  iconColor,
});

export const technologies = {
  // Frontend
  react: t("react", "React", "frontend", "devicon:react", true, 1),
  nextjs: t("nextjs", "Next.js", "frontend", "devicon:nextjs", true, 2),
  typescript: t(
    "typescript",
    "TypeScript",
    "frontend",
    "devicon:typescript",
    true,
    3,
  ),
  javascript: t(
    "javascript",
    "JavaScript",
    "frontend",
    "devicon:javascript",
    true,
    4,
  ),
  tailwind: t(
    "tailwind",
    "Tailwind CSS",
    "frontend",
    "thesvg-color:tailwind-css",
    true,
    5,
  ),
  bootstrap: t(
    "bootstrap",
    "Bootstrap",
    "frontend",
    "devicon:bootstrap",
    false,
    6,
  ),
  materialUi: t(
    "material-ui",
    "Material UI",
    "frontend",
    "thesvg-color:material-ui",
    false,
    7,
  ),
  shadcn: t("shadcnui", "shadcn/ui", "frontend", "thesvg:shadcn-ui", false, 8),

  // State management
  redux: t("redux", "Redux", "frontend", "devicon:redux", false, 9),
  zustand: t("zustand", "Zustand", "frontend", "devicon:zustand", false, 10),

  // Mobile
  reactNative: t(
    "react-native",
    "React Native",
    "mobile",
    "logos:react",
    true,
    1,
  ),
  expo: t("expo", "Expo", "mobile", "cib:expo", false, 2),
  // Backend & APIs
  node: t("node", "Node.js", "backend", "devicon:nodejs", true, 1),
  express: t(
    "express",
    "Express.js",
    "backend",
    "skill-icons:expressjs-dark",
    true,
    2,
  ),
  rest: t("rest", "REST APIs", "backend", "carbon:api-1", true, 3),
  webSockets: t(
    "websockets",
    "WebSockets",
    "backend",
    "selfhst:websocket",
    false,
    4,
  ),
  webRTC: t("webrtc", "WebRTC", "backend", "logos:webrtc", false, 5),

  // Databases & ORM
  postgres: t(
    "postgres",
    "PostgreSQL",
    "databases",
    "devicon:postgresql",
    true,
    1,
  ),
  mysql: t("mysql", "MySQL", "databases", "logos:mysql", false, 2),
  mongodb: t("mongodb", "MongoDB", "databases", "logos:mongodb-icon", true, 3),
  prisma: t(
    "prisma",
    "Prisma ORM",
    "databases",
    "material-icon-theme:prisma",
    false,
    4,
  ),
  redis: t("redis", "Redis", "databases", "devicon:redis", false, 5),
  firebase: t(
    "firebase",
    "Firebase",
    "databases",
    "thesvg-color:firebase",
    true,
    6,
  ),
  supabase: t("supabase", "Supabase", "databases", "devicon:supabase", true, 7),

  // AI & Generative AI
  python: t("python", "Python", "ai", "devicon:python", true, 1),
  generativeAi: t(
    "generative-ai",
    "Generative AI",
    "ai",
    "fluent-emoji-flat:sparkles",
    true,
    2,
  ),
  llms: t("llms", "LLMs", "ai", "andrsrxn:brain-sparkle", false, 3),
  rag: t("rag", "RAG", "ai", "icon-park:database-search", false, 4),
  agents: t("agents", "Agentic AI", "ai", "andrsrxn:agent", true, 5, "#f58800"),
  openaiApis: t(
    "openai-apis",
    "OpenAI APIs",
    "ai",
    "selfhst:chatgpt",
    false,
    6,
  ),
  fastapi: t(
    "fastapi",
    "FastAPI",
    "ai",
    "simple-icons:fastapi",
    false,
    7,
    "#019486",
  ),
  langchain: t(
    "langchain",
    "LangChain",
    "ai",
    "thesvg-color:langchain-corporate",
    true,
    8,
  ),
  langgraph: t(
    "langgraph",
    "LangGraph",
    "ai",
    "thesvg-color:langgraph-langchain",
    true,
    9,
  ),
  vectorDatabases: t(
    "vector-databases",
    "Vector Databases",
    "ai",
    "iconoven:vector-db",
    true,
    10,
  ),
  chroma: t("chroma", "Chroma", "ai", "thesvg-color:chroma", false, 11),
  pinecone: t("pinecone", "Pinecone", "ai", "logos:pinecone-icon", false, 12),
  weaviate: t("weaviate", "Weaviate", "ai", "logos:weaviate-icon", false, 13),
  qdrant: t("qdrant", "Qdrant", "ai", "thesvg-color:qdrant-light", false, 14),
  huggingFace: t(
    "hugging-face",
    "Hugging Face",
    "ai",
    "thesvg-color:hugging-face",
    false,
    15,
  ),
  faiss: t("faiss", "Faiss", "ai", "thesvg-color:meta", false, 16),

  // Cloud, DevOps & Tools
  aws: t("aws", "AWS", "cloud", "logos:aws", true, 1),
  s3: t("s3", "AWS S3", "cloud", "selfhst:amazon-s3", true, 2),
  backblazeB2: t(
    "backblaze-b2",
    "Backblaze B2",
    "cloud",
    "thesvg-color:backblaze",
    false,
    3,
  ),
  docker: t("docker", "Docker", "cloud", "logos:docker-icon", true, 4),
  googleCloud: t(
    "google-cloud",
    "Google Cloud",
    "cloud",
    "devicon:googlecloud",
    true,
    6,
  ),

  // Developer tools
  postman: t("postman", "Postman", "tools", "devicon:postman", false, 1),
  git: t("git", "Git", "tools", "devicon:git", false, 5),
  xcode: t("xcode", "Xcode", "tools", "logos:xcode", false, 6),
  vsCode: t("vs-code", "VS Code", "tools", "devicon:vscode", false, 7),
  androidStudio: t(
    "android-studio",
    "Android Studio",
    "tools",
    "thesvg-color:android-studio",
    false,
    8,
  ),
} satisfies Record<string, TechnologyItem>;

const T = technologies;

export const skills: SkillCategoryData[] = [
  {
    id: "frontend",
    title: "Frontend",
    description: "Modern, responsive interfaces and component-driven UI.",
    technologies: [
      T.react,
      T.nextjs,
      T.typescript,
      T.javascript,
      T.tailwind,
      // T.bootstrap,
      // T.materialUi,
      T.shadcn,
    ],
    sortOrder: 1,
  },
  {
    id: "state-management",
    title: "State Management",
    description: "Predictable and maintainable application state.",
    technologies: [T.redux, T.zustand],
    sortOrder: 2,
  },
  {
    id: "mobile",
    title: "Mobile Development",
    description: "Cross-platform mobile experiences.",
    technologies: [T.reactNative, T.expo],
    sortOrder: 3,
  },
  {
    id: "backend",
    title: "Backend & APIs",
    description: "Reliable services, APIs, and real-time communication.",
    technologies: [T.node, T.express, T.rest, T.webSockets, T.webRTC],
    sortOrder: 4,
  },
  {
    id: "databases",
    title: "Databases & Data Services",
    description: "Data persistence, caching, and managed backend services.",
    technologies: [
      T.postgres,
      T.mysql,
      T.mongodb,
      T.prisma,
      T.redis,
      T.supabase,
      T.firebase,
    ],
    sortOrder: 5,
  },
  {
    id: "ai",
    title: "AI & Generative AI",
    description: "LLM applications, retrieval, and AI agents.",
    technologies: [
      T.python,
      T.fastapi,
      T.generativeAi,
      T.llms,
      T.rag,
      T.langchain,
      T.langgraph,
      T.agents,
      T.openaiApis,
      T.vectorDatabases,
    ],
    sortOrder: 6,
  },
  {
    id: "cloud",
    title: "Cloud & Infrastructure",
    description: "Deployment, infrastructure, and development workflows.",
    technologies: [T.s3, T.backblazeB2, T.googleCloud, T.docker],
    sortOrder: 7,
  },
  {
    id: "tools",
    title: "Developer Tools",
    description: "Tools for API development and testing.",
    technologies: [T.postman, T.git, T.xcode, T.vsCode, T.androidStudio],
    sortOrder: 8,
  },
];

// PLACEHOLDER projects — replace with real work, links and screenshots.
export const projects: PortfolioProject[] = [
  {
    id: "p1",
    slug: "document-assistant",
    title: "AI Document Assistant",
    summary: "Chat with your documents using retrieval-augmented generation.",
    description:
      "A web app that ingests PDFs and docs, chunks and embeds them, and answers questions with cited sources. Built around a streaming chat UI and a FastAPI retrieval service.",
    category: "AI · Web",
    image_path: projectAi,
    image_alt:
      "Screenshot of the AI Document Assistant showing a document list and chat panel",
    technologies: [T.nextjs, T.typescript, T.fastapi, T.postgres, T.langgraph],
    live_url: "https://example.com",
    github_url: "https://github.com/",
    highlights: [
      "Streaming responses with source citations",
      "Hybrid keyword + vector search",
      "Background ingestion queue",
    ],
    is_featured: true,
    is_published: true,
    display_order: 1,
  },
  {
    id: "p2",
    slug: "habit-tracker",
    title: "Muse-AI-Agent-Clone",
    summary: "A clone of the Muse AI Agent.",
    description:
      "A pixel-perfect, universal React Native application for Muse AI and companion Cooper — an autonomous AI agent for recurring tasks, workflows, and goals.",
    category: "Mobile",
    image_path: projectMuseAgent,
    image_alt: "Two phone screens showing Muse AI and Cooper",
    technologies: [
      T.reactNative,
      T.typescript,
      T.expo,
      T.supabase,
      T.agents,
      T.openaiApis,
    ],
    live_url: null,
    github_url: "https://github.com/shubhammore1251/Muse-AI-Agent-Clone",
    highlights: [
      "Multi-step agent task execution using browser automation and connected tools.",
      "Composio integrations with Google, GitHub, Slack, Notion, and more.",
    ],
    is_featured: false,
    is_published: true,
    display_order: 2,
  },
  {
    id: "p3",
    slug: "buildlyio",
    title: "Buildly.io - AI Powered Website Builder",
    summary:
      "A website builder that uses AI to generate a website based on your needs.",
    description:
      "Buildly.io is a website builder that uses AI to generate a website based on your needs. It uses OpenAI LLM to generate the website and AI Agents to create the content.",
    category: "AI · Web",
    image_path: projectBuildlyio,
    image_alt: "Buildly.io Image",
    technologies: [
      T.nextjs,
      T.tailwind,
      T.shadcn,
      T.openaiApis,
      T.agents,
      T.postgres,
    ],
    live_url: "https://buildlyio.shubhammoredev.com",
    github_url: "https://github.com/shubhammore1251/buildlyio",
    highlights: [
      "AI Agents to create the content",
      "Background agent orchestration using Inngest",
      "Secure sandboxed execution using E2B",
    ],
    is_featured: false,
    is_published: true,
    display_order: 3,
  },
];

// PLACEHOLDER experience — replace with real roles.
export const experience: PortfolioExperience[] = [
  {
    id: "e1",
    company: "Metricoid Technology Solutions",
    role: "Associate Software Engineer",
    location: "Mumbai, India",
    employmentType: "Full-time",
    startDate: "2023-11",
    endDate: "2025-11",
    isCurrent: true,
    summary:
      "Building product features across the web app, APIs and AI services.",
    achievements: [
      "Built and maintained mobile & web apps using React Native, React.js, Next.js, and Express.js.",
      "Integrated AI agents and LLM-powered Python APIs into React and Next.js applications.",
      "Converted UX designs into pixel-perfect, responsive UIs for better cross-platform experience.",
      "Integrated REST APIs, authentication, payments, and push notifications.",
      "Developed real-time features using Socket.io and WebRTC (PeerJS) for chat, proctoring, and collaboration tools.",
      "Enhanced live proctoring and screen recording systems with AWS S3 and cloud storage integrations.",
      "Revamped company website using Next.js (SSR/ISR/SSG) achieving ~95% performance and SEO scores.",
      "Built prototypes and MVPs using React, Next.js, Express, and Node.js for rapid client validation.",
      "Collaborated with cross-functional and international teams to ship production-ready features.",
      "Mentored interns and improved team code quality, reviews, and development practices.",
    ],
    technologies: [T.react, T.nextjs, T.tailwind, T.python, T.typescript, T.express, T.postgres, T.mysql, T.reactNative, T.webSockets, T.webRTC, T.docker, T.s3, T.backblazeB2],
    sortOrder: 1,
  },
];

// PLACEHOLDER posts — will be replaced by Hashnode data with the same shape.
export const blogPosts: PortfolioBlogPost[] = [
  {
    id: "b1",
    title: "What I learned building my first RAG pipeline",
    slug: "first-rag-pipeline",
    excerpt:
      "Chunking strategies, evaluation, and the surprising things that actually improved answer quality.",
    coverImageUrl: blog1,
    publishedAt: "2026-08-12T00:00:00.000Z",
    readingTimeMinutes: 8,
    tags: ["AI", "RAG", "Python"],
    url: "https://hashnode.com/",
    source: "hashnode",
    sortOrder: 1,
  },
  {
    id: "b2",
    title: "Structuring a Next.js app that stays maintainable",
    slug: "maintainable-nextjs",
    excerpt:
      "Folder conventions, data boundaries and the small decisions that compound over time.",
    coverImageUrl: null,
    publishedAt: "2026-06-03T00:00:00.000Z",
    readingTimeMinutes: 6,
    tags: ["Next.js", "Architecture"],
    url: "https://hashnode.com/",
    source: "hashnode",
    sortOrder: 2,
  },
  {
    id: "b3",
    title: "Dockerising a Node.js API the boring way",
    slug: "docker-node-api",
    excerpt:
      "A practical, no-magic setup for local development and production images.",
    coverImageUrl: null,
    publishedAt: "2026-03-20T00:00:00.000Z",
    readingTimeMinutes: 5,
    tags: ["Docker", "Node.js"],
    url: "https://hashnode.com/",
    source: "hashnode",
    sortOrder: 3,
  },
];

export const navItems = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "blog", label: "Blog" },
  { id: "contact", label: "Contact" },
];
