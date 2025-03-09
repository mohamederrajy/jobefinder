export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  hourlyRate: number;
  address: {
    city: string;
    state?: string;
    zipCode?: string;
  };
  requirements?: string[];
  tags?: string[];
  createdAt: string;
  isUrgent?: boolean;
} 