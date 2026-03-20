export async function handler(event, context) {
  const scripts = [
    { id: "script1", lastMod: "2026-03-21" },
    { id: "script2", lastMod: "2026-03-21" },
  ];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  scripts.forEach(script => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>https://ccraftspace.netlify.app/script.html?id=${script.id}</loc>\n`;
    sitemap += `    <lastmod>${script.lastMod}</lastmod>\n`;
    sitemap += `  </url>\n`;
  });

  sitemap += `</urlset>`;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/xml" },
    body: sitemap
  };
}
