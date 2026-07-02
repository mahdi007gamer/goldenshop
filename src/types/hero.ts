export interface FeatureCard {
  id: string;
  icon: 'wrench' | 'shield' | 'chat';
  title: string;
  description: string;
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ParallaxState {
  x: number;
  y: number;
}
