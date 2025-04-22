export interface StoreInfo {
  name: string;
  address?: string;
  phone?: string;
}

export interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  rating: string;
}

export interface QA {
  question: string;
  answer: string;
}
