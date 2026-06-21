import { Category, Season, RoleType } from './filters';

export interface Job {
  id: string;
  title: string;
  company: string;
  initials: string;
  color: string;
  location: string;
  province: string;
  category: Category;
  postedAt: Date;
  deadline?: Date;
  season: Season;
  roleType: RoleType;
  isRelated: boolean;
  applyUrl: string;
  description: string;
  sponsorship: string;
}

