const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONTENT_PATH = 'blog-data.json';

const API_BASE = 'https://api.github.com';

function ensureEnv(res) {
  if (!OWNER || !REPO || !TOKEN) {
    res.status(500).json({ success: false, error: 'Missing GITHUB_OWNER/GITHUB_REPO/GITHUB_TOKEN' });
    return false;
  }
  return true;
}

async function getExistingSha() {
  const url = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}?ref=${BRANCH}`;
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (!resp.ok) {
    return null;
  }

  const json = await resp.json();
  return json.sha;
}

async function saveFile(content, sha) {
  const url = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${CONTENT_PATH}`;
  const body = {
    message: `Update blog cards via admin`,
    branch: BRANCH,
    content,
  };
  if (sha) {
    body.sha = sha;
  }
  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    throw new Error(error.message || `GitHub API error ${resp.status}`);
  }

  return resp.json();
}

function buildArticleHtml(article) {
  const { title, slug, coverUrl, preview, bodyHtml } = article;
  const safeTitle = title || 'Статья';
  const safePreview = preview || '';
  const safeBody = bodyHtml || '';
  const hero = coverUrl
    ? `<div class="article-hero" style="background-image:url('${coverUrl}');"></div>`
    : '<div class="article-hero article-hero--noimage"></div>';

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} — Виктория Консалт</title>
  <link rel="stylesheet" href="/styles/layout.css">
  <style>
    body {
      background: #f8f8f9;
      color: #1c1c1c;
      font-family: 'Open Sans', sans-serif;
      margin:0;
    }
    .article-hero {
      width:100%;
      height:320px;
      background-size:cover;
      background-position:center;
      position:relative;
    }
    .article-hero--noimage {
      background:#222;
    }
    .article-container {
      max-width:940px;
      margin:0 auto;
      padding:1.5rem;
    }
    .article-preview {
      font-size:1.1rem;
      margin-bottom:1.5rem;
      color:#444;
    }
    .article-body {
      line-height:1.6;
    }
  </style>
</head>
<body>
  <header>
    <div class="header_top clearfix">
      <div class="header-item header-logo">
        <a href="/"><img src="/assets/image-132183f4-a90c-4bb2-bf58-57313ca3ff13.png" alt="Виктория Консалт"></a>
      </div>
    </div>
  </header>
  ${hero}
  <main class="article-container">
    <h1>${safeTitle}</h1>
    <p class="article-preview">${safePreview}</p>
    <section class="article-body">
      ${safeBody}
    </section>
  </main>
  <footer class="site-footer">
    <div class="footer-grid">
      <div>
        <div class="logo">
          <a href="/"><img src="/assets/image-132183f4-a90c-4bb2-bf58-57313ca3ff13.png" alt="Виктория Консалт"></a>
        </div>
        <p>Комплекс бизнес-поддержки с 2006 года.</p>
      </div>
    </div>
    <div class="copyright">Copyright © 2006-2026 Все права защищены.</div>
  </footer>
</body>
</html>`;
}

async function writeArticleFile(article) {
  if (!article.slug) {
    throw new Error('У статьи должен быть slug');
  }
  const path = `article-${article.slug}.html`;
  const url = `${API_BASE}/repos/${OWNER}/${REPO}/contents/${path}`;
  const existing = await fetch(`${url}?ref=${BRANCH}`, {
    method: 'GET',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  const html = buildArticleHtml(article);
  const base64 = Buffer.from(html).toString('base64');
  const payload = {
    message: `Generate article ${article.slug}`,
    branch: BRANCH,
    content: base64,
  };

  if (existing.ok) {
    const data = await existing.json();
    payload.sha = data.sha;
  }

  const resp = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const error = await resp.json().catch(() => ({}));
    throw new Error(error.message || `Cannot write ${path}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (!ensureEnv(res)) return;

  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }

  try {
    if (Array.isArray(data.articles)) {
      for (const article of data.articles) {
        await writeArticleFile(article);
      }
    }

    const sha = await getExistingSha();
    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const content = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
    await saveFile(content, sha);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
