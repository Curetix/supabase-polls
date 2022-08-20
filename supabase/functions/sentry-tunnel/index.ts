import { serve } from "https://deno.land/std@0.152.0/http/server.ts"
import corsHeaders from '../_shared/cors.ts';

const sentryHost = Deno.env.get("SENTRY_HOST") || '';
const sentryProjectId = Deno.env.get("SENTRY_PROJECT_ID") || '';

const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

console.log("Function sentry-tunnel is running.");
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('{}', { headers });
  }

  try {
    const envelope = await req.text();
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);

    const { host, pathname: path } = new URL(header.dsn as string);
    if (host !== sentryHost) {
      console.warn('Invalid host:', host);
      return new Response(
        JSON.stringify({ message: `Invalid host: ${host}` }),
        { status: 400, headers },
      );
    }

    let projectId = path.startsWith('/') ? path.slice(1) : path;
    projectId = projectId.endsWith('/') ? projectId.slice(0, -1) : projectId;
    if (projectId !== sentryProjectId) {
      console.warn('Invalid project ID:', projectId);
      return new Response(
        JSON.stringify({ message:  `Invalid project id: ${projectId}` }),
        { status: 400, headers },
      );
    }

    const url = `https://${sentryHost}/api/${projectId}/envelope/`;
    const res = await fetch(url, {
      method: 'POST',
      body: envelope,
    });
    return new Response(
      JSON.stringify(await res.json()),
      { status: 200, headers },
    );
  } catch (e) {
    console.error('Error during tunnel request:', e);
    return new Response(
      JSON.stringify({ message: 'Invalid request.' }),
      { status: 400, headers },
    );
  }
});
