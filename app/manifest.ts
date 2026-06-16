import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CaféPOS - Coffee Shop Point of Sale System',
    short_name: 'CaféPOS',
    description: 'CaféPOS is a modern point of sale system designed specifically for coffee shops. Manage your menu, take orders, and track sales with ease.',
    start_url: '/auth/login',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/favicon/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}