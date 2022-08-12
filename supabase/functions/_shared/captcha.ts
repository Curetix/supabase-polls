export async function verifyUserResponse(userResponse: string, ip?: string) {
  const data = new URLSearchParams();
  data.append('secret', Deno.env.get('HCAPTCHA_SITE_KEY') ?? '');
  data.append('sitekey', Deno.env.get('HCAPTCHA_SECRET') ?? '');
  data.append('response', userResponse);
  if (ip) data.append('remoteIp', ip);

  const response = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    body: data,
  });

  if (response.ok) {
    const json = await response.json();
    return json.success;
  } else {
    return false;
  }
}
