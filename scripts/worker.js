/**
 * Cloudflare Worker for Sinister Dexter Website
 * Serves static assets with proper headers and caching
 */

import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

// Cache control settings by file type
const CACHE_CONTROL = {
  // HTML files - short cache with revalidation
  'text/html': 'public, max-age=300, must-revalidate',
  // Images - cache for 1 year (immutable)
  'image/jpeg': 'public, max-age=31536000, immutable',
  'image/png': 'public, max-age=31536000, immutable',
  'image/webp': 'public, max-age=31536000, immutable',
  'image/svg+xml': 'public, max-age=31536000, immutable',
  // CSS and JS - cache for 1 week
  'text/css': 'public, max-age=604800',
  'application/javascript': 'public, max-age=604800',
  'text/javascript': 'public, max-age=604800',
  // JSON data - cache for 1 hour
  'application/json': 'public, max-age=3600',
  // Fonts - cache for 1 year
  'font/woff2': 'public, max-age=31536000, immutable',
  'font/woff': 'public, max-age=31536000, immutable',
  // Default for other types
  'default': 'public, max-age=86400'
};

// Security headers
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    try {
      // Handle root path
      if (url.pathname === '/') {
        url.pathname = '/index.html';
      }
      
      // Attempt to serve the asset from KV
      const response = await getAssetFromKV(
        {
          request: new Request(url.toString(), request),
          waitUntil: ctx.waitUntil.bind(ctx)
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
          mapRequestToAsset: (request) => {
            // Clean up the URL path
            const url = new URL(request.url);
            
            // Remove trailing slashes except for root
            if (url.pathname !== '/' && url.pathname.endsWith('/')) {
              url.pathname = url.pathname.slice(0, -1);
            }
            
            // Add index.html for directory requests
            if (!url.pathname.includes('.')) {
              url.pathname = url.pathname + '/index.html';
            }
            
            return new Request(url.toString(), request);
          },
          cacheControl: {
            bypassCache: false,
          }
        }
      );
      
      // Clone the response to modify headers
      const modifiedResponse = new Response(response.body, response);
      
      // Get content type
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const mainType = contentType.split(';')[0].trim();
      
      // Set cache control based on content type
      const cacheControl = CACHE_CONTROL[mainType] || CACHE_CONTROL['default'];
      modifiedResponse.headers.set('Cache-Control', cacheControl);
      
      // Add security headers
      Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
        modifiedResponse.headers.set(key, value);
      });
      
      // Add CORS headers if needed (for API calls)
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/contact/')) {
        modifiedResponse.headers.set('Access-Control-Allow-Origin', '*');
        modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        modifiedResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      }
      
      return modifiedResponse;
      
    } catch (e) {
      // If asset not found, try to serve 404.html
      if (e.status === 404) {
        try {
          const notFoundResponse = await getAssetFromKV(
            {
              request: new Request(url.origin + '/404.html', request),
              waitUntil: ctx.waitUntil.bind(ctx)
            },
            {
              ASSET_NAMESPACE: env.__STATIC_CONTENT,
              ASSET_MANIFEST: assetManifest
            }
          );
          
          return new Response(notFoundResponse.body, {
            status: 404,
            headers: {
              'content-type': 'text/html;charset=UTF-8',
              ...SECURITY_HEADERS
            }
          });
        } catch (e) {
          // If 404.html also not found, return basic 404
          return new Response('Not Found', { 
            status: 404,
            headers: SECURITY_HEADERS
          });
        }
      }
      
      // For other errors, return 500
      return new Response('Internal Server Error', { 
        status: 500,
        headers: SECURITY_HEADERS
      });
    }
  }
};