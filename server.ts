import express from 'express';
import { createServer as createViteServer } from 'vite';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import cron from 'node-cron';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- JSON Database Setup ---
const DB_FILE = path.join(__dirname, 'posts.json');

function getPosts(): any[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database:', error);
    return [];
  }
}

function savePosts(posts: any[]) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error saving database:', error);
  }
}

// --- File Upload Setup ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// --- SSE Setup ---
let clients: any[] = [];

function sendNotificationToAll(data: any) {
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(data)}\n\n`));
}

// --- Background Scheduler ---
// Run every minute to check for due posts
cron.schedule('* * * * *', () => {
  const now = new Date().toISOString();
  console.log(`[Scheduler] Checking for posts due before ${now}...`);

  const posts = getPosts();
  let hasChanges = false;

  for (const post of posts) {
    if (post.status !== 'pending') continue;

    let isDue = false;

    try {
      if (post.scheduledTime.startsWith('{')) {
        // Handle Recurring Logic (Simplified)
        const schedule = JSON.parse(post.scheduledTime);
        const currentTime = new Date();
        const currentDay = currentTime.getDay(); // 0 = Sun
        const currentHM = currentTime.toTimeString().slice(0, 5); // "HH:MM"

        if (schedule.type === 'daily') {
          if (currentHM === schedule.time) isDue = true;
        } else if (schedule.type === 'weekly') {
          if (schedule.days.includes(currentDay) && currentHM === schedule.time) isDue = true;
        }
      } else {
        // One-time post
        if (post.scheduledTime <= now) {
          isDue = true;
        }
      }
    } catch (e) {
      console.error(`[Scheduler] Error parsing schedule for post ${post.id}`, e);
      // Mark as failed if schedule is invalid
      post.status = 'failed';
      hasChanges = true;
      sendNotificationToAll({
        type: 'error',
        title: '포스팅 실패',
        message: `"${post.title}" 예약 설정 오류: 스케줄을 파싱할 수 없습니다.`
      });
      continue;
    }

    if (isDue) {
      console.log(`[Scheduler] Publishing post: ${post.title}`);
      
      // Simulate API Call Success/Failure
      // In a real app, you would call the Naver API here.
      // We'll simulate a random failure for demonstration purposes (10% chance)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        post.status = 'posted';
        sendNotificationToAll({
          type: 'success',
          title: '포스팅 성공',
          message: `"${post.title}" 게시글이 성공적으로 등록되었습니다.`
        });
      } else {
        post.status = 'failed';
        sendNotificationToAll({
          type: 'error',
          title: '포스팅 실패',
          message: `"${post.title}" 등록 실패: 네이버 API 오류 (Simulated)`
        });
      }
      
      hasChanges = true;
      console.log(`[Scheduler] Post ${post.id} marked as ${post.status}.`);
    }
  }

  if (hasChanges) {
    savePosts(posts);
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cookieParser());
  app.use(express.json());

  // Logging Middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // --- API Routes ---

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // SSE Endpoint for Notifications
  app.get('/api/notifications', (req, res) => {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);

    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res
    };
    clients.push(newClient);

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'info', message: 'Connected to notification server' })}\n\n`);

    req.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter(client => client.id !== clientId);
    });
  });

  // Posts API
  app.get('/api/posts', (req, res) => {
    const posts = getPosts();
    // Sort by createdAt desc
    posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(posts);
  });

  app.post('/api/posts', (req, res) => {
    const { id, title, content, cafeName, scheduledTime, status } = req.body;
    const posts = getPosts();
    
    const newPost = {
      id: id || Date.now().toString(),
      title,
      content,
      cafeName,
      scheduledTime,
      status: status || 'pending',
      createdAt: new Date().toISOString()
    };

    posts.push(newPost);
    savePosts(posts);
    
    res.json({ success: true, post: newPost });
  });

  app.put('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const posts = getPosts();
    
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    posts[index] = { ...posts[index], ...updates };
    savePosts(posts);

    res.json({ success: true, post: posts[index] });
  });

  app.delete('/api/posts/:id', (req, res) => {
    const { id } = req.params;
    let posts = getPosts();
    
    const initialLength = posts.length;
    posts = posts.filter(p => p.id !== id);
    
    if (posts.length === initialLength) {
      return res.status(404).json({ error: 'Post not found' });
    }

    savePosts(posts);
    res.json({ success: true });
  });

  // File Upload Endpoint
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `${process.env.APP_URL || `http://localhost:${PORT}`}/uploads/${req.file.filename}`;
    
    res.json({ 
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype
    });
  });

  // Auth Endpoints
  app.get('/api/auth/naver/url', (req, res) => {
    const clientId = process.env.NAVER_CLIENT_ID;
    
    // Robust Redirect URI construction
    let baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      // Fallback for local dev if APP_URL is missing
      const protocol = req.protocol;
      const host = req.get('host');
      baseUrl = `${protocol}://${host}`;
    }
    
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const redirectUri = `${baseUrl}/api/auth/naver/callback`;
    const state = Math.random().toString(36).substring(7);

    if (!clientId) {
      console.error('NAVER_CLIENT_ID is missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error: NAVER_CLIENT_ID is missing' });
    }

    const authUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    res.json({ url: authUrl });
  });

  app.get('/api/auth/naver/callback', async (req, res) => {
    const { code, state } = req.query;
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    if (!code || !clientId || !clientSecret) {
      return res.status(400).send('Invalid request or missing credentials');
    }

    try {
      const tokenResponse = await axios.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code,
          state,
        },
      });

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        throw new Error('Failed to retrieve access token');
      }
      
      const successHtml = `
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'NAVER_AUTH_SUCCESS', 
                  token: '${access_token}' 
                }, '*');
                window.close();
              } else {
                document.write('Authentication successful. You can close this window.');
              }
            </script>
            <p>Authentication successful. Closing...</p>
          </body>
        </html>
      `;
      
      res.send(successHtml);

    } catch (error: any) {
      console.error('Naver Auth Error:', error.response?.data || error.message);
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  app.get('/api/naver/cafes', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    try {
      const response = await axios.get('https://openapi.naver.com/v1/cafe/getJoinCafeList', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      res.json(response.data);
    } catch (error: any) {
      console.error('Naver API Error:', error.response?.data || error.message);
      if (error.response?.status === 403 || error.response?.status === 404) {
         return res.json({ 
           message: 'API permission missing', 
           cafes: [] 
         });
      }
      res.status(500).json({ error: 'Failed to fetch cafes' });
    }
  });
  
  app.get('/api/naver/profile', async (req, res) => {
      const accessToken = req.headers.authorization?.split(' ')[1];
  
      if (!accessToken) {
        return res.status(401).json({ error: 'No access token provided' });
      }
  
      try {
        const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
  
        res.json(response.data);
      } catch (error: any) {
        console.error('Naver Profile Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
      }
    });

  // --- API 404 Handler ---
  // Ensure API requests that don't match a route return 404 JSON, not HTML
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // --- Vite Middleware ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
