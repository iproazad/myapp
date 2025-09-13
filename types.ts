
export enum LogoStyle {
  MODERN = 'Modern',
  VINTAGE = 'Vintage',
  MINIMALIST = 'Minimalist',
  LUXURY = 'Luxury',
  SPORTY = 'Sporty',
  FUTURISTIC = 'Futuristic',
}

export interface LogoConfig {
  style: LogoStyle;
  color: string;
  text: string;
  details: string;
}
