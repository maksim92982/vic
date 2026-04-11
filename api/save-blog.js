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
