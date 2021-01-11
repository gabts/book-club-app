export interface Book {
  id: number;
  author: string;
  title: string;
  year: number;
}

export interface BookInput {
  author: string;
  title: string;
  year: number;
}

export interface Question {
  id: number;
  book: null | number;
  text: string;
}

export interface QuestionInput {
  book: null | number;
  text: string;
}
