export type ToolCategory =
  | 'json-data'
  | 'text-diff'
  | 'encoding'
  | 'security'
  | 'web-dev'
  | 'css-design'
  | 'time-date'
  | 'dev-utilities';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  keywords: string[];
  isPopular?: boolean;
  sampleInput?: string;
  sampleSecondaryInput?: string;
}

export interface ToastMessage {
  id: string;
  text: string;
  type?: 'success' | 'error' | 'info';
}
