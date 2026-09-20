import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cooperative Mitra — सहकारी मित्र',
    short_name: 'CoopMitra',
    description: 'Multilingual Conversational Assistant, Scheme Discovery, and Grievance Management for Indian Cooperatives (PACS)',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#15803d',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  };
}
