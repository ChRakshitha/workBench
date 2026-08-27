import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { config } from './config.js';
import { authRoutes } from './routes/auth.route.js';
import { categoryRoutes } from './routes/categories.route.js';
import { projectRoutes } from './routes/projects.route.js';
import { tagRoutes } from './routes/tags.route.js';
import { checklistItemRoutes } from './routes/checklistItems.route.js';
import { projectLinkRoutes } from './routes/projectLinks.route.js';
import { commentRoutes } from './routes/comments.route.js';
import { dashboardRoutes } from './routes/dashboard.route.js';

const app = Fastify({
  logger: true,
});

app.register(cookie);

app.get('/health', async () => {
  return { status: 'ok' };
});

app.register(authRoutes, { prefix: '/auth' });
app.register(categoryRoutes, { prefix: '/categories' });
app.register(tagRoutes, { prefix: '/tags' });
app.register(projectRoutes, { prefix: '/projects' });
app.register(checklistItemRoutes, { prefix: '/projects/:projectId/checklist-items' });
app.register(projectLinkRoutes, { prefix: '/projects/:projectId/links' });
app.register(commentRoutes, { prefix: '/projects/:projectId/comments' });
app.register(dashboardRoutes, { prefix: '/dashboard' });

app
  .listen({ port: config.port })
  .then(() => {
    app.log.info(`api listening on http://localhost:${config.port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
