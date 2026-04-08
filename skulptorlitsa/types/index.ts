export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  cover: string;
  duration: string;
  lessonsCount: number;
  price: number;
  oldPrice?: number;
  startDate?: string;
  category: string;
  forWhom: string[];
  results: string[];
  outline?: CourseModule[];
}

export interface CourseModule {
  title: string;
  lessons: string[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  order: number;
  description?: string;
}

export interface Stream {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'live' | 'ended';
  startAt: string;
  hlsUrl?: string;
  recordingUrl?: string;
  isOpen: boolean;
  thumbnail?: string;
}

export interface Review {
  id: string;
  author: string;
  avatar?: string;
  age?: number;
  text: string;
  rating: number;
  courseTitle?: string;
  date: string;
  before?: string;
  after?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover: string;
  publishedAt: string;
  readTime: number;
  tags: string[];
}

export interface MasterClass {
  id: string;
  title: string;
  description: string;
  date: string;
  duration: string;
  price: number;
  spotsLeft: number;
  cover: string;
  topics: string[];
}

export interface UserAccess {
  courseId: string;
  courseTitle: string;
  expiresAt: string;
  grantedAt: string;
}

export interface Application {
  name: string;
  phone: string;
  email: string;
  courseId?: string;
  consent: boolean;
}
