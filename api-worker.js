/**
 * Zentra API Worker for Cloudflare Workers
 * This handles API requests at api.zentrahub.pro
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://zentrahub.pro',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    try {
      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({
          status: 'OK',
          timestamp: new Date().toISOString(),
          service: 'Zentra API',
          version: '1.0.0'
        }), {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // Proxy to actual backend (temporary solution)
      // In production, implement the full API here or use a separate backend
      if (url.pathname.startsWith('/api/')) {
        // For now, return a message about backend setup
        return new Response(JSON.stringify({
          message: 'API endpoint not yet implemented',
          endpoint: url.pathname,
          note: 'Deploy your Node.js backend and update this worker to proxy requests'
        }), {
          status: 501,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        });
      }

      // 404 for other routes
      return new Response(JSON.stringify({
        error: 'Not Found',
        path: url.pathname
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  },
};