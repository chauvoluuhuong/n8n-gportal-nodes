# n8n Docker Compose Setup

This Docker Compose configuration provides a complete n8n setup with your custom GPortal nodes.

## Quick Start

1. **Start n8n:**

   ```bash
   docker-compose up -d
   ```

2. **Access n8n:**
   - Open your browser and go to: `http://localhost:5678`
   - Login with:
     - Username: `admin`
     - Password: `password`

3. **Stop n8n:**
   ```bash
   docker-compose down
   ```

## Configuration

### Environment Variables

The Docker Compose file includes the following key configurations:

- **Database**: SQLite (default) - data persists in Docker volume
- **Authentication**: Basic auth enabled with admin/password
- **Custom Nodes**: Your GPortal nodes are automatically mounted
- **Port**: 5678 (standard n8n port)
- **Webhooks**: Configured for localhost

### Custom Nodes Integration

Your GPortal nodes are automatically available in n8n because:

1. The `./nodes` directory is mounted to `/home/node/.n8n/custom/nodes`
2. The `N8N_CUSTOM_EXTENSIONS` environment variable points to the custom directory
3. n8n will automatically detect and load your custom nodes

## Advanced Configuration

### Using PostgreSQL (Production)

To use PostgreSQL instead of SQLite:

1. Uncomment the PostgreSQL service in `docker-compose.yml`
2. Update the n8n environment variables:
   ```yaml
   environment:
     - DB_TYPE=postgresdb
     - DB_POSTGRESDB_HOST=postgres
     - DB_POSTGRESDB_PORT=5432
     - DB_POSTGRESDB_DATABASE=n8n
     - DB_POSTGRESDB_USER=n8n
     - DB_POSTGRESDB_PASSWORD=n8n_password
   ```

### Using Redis (Production)

For better performance in production, uncomment the Redis service and add these environment variables to n8n:

```yaml
environment:
  - QUEUE_BULL_REDIS_HOST=redis
  - QUEUE_BULL_REDIS_PORT=6379
  - QUEUE_BULL_REDIS_DB=0
```

### Security

**Important**: Change the default password before production use:

1. Edit the `docker-compose.yml` file
2. Update `N8N_BASIC_AUTH_PASSWORD=your_secure_password`
3. Restart the container: `docker-compose restart`

## Data Persistence

- **n8n data**: Stored in Docker volume `n8n_data`
- **Custom nodes**: Mounted from `./nodes` directory
- **Database**: SQLite file or PostgreSQL data volume

## Troubleshooting

### View Logs

```bash
docker-compose logs n8n
```

### Access Container Shell

```bash
docker-compose exec n8n sh
```

### Reset Data

```bash
docker-compose down -v
docker-compose up -d
```

### Health Check

The container includes a health check that verifies n8n is running properly.

## Development

For development with your custom nodes:

1. Make changes to your node files in the `./nodes` directory
2. Restart the n8n container: `docker-compose restart n8n`
3. Your changes will be immediately available in n8n

## Production Considerations

1. **Use PostgreSQL** for better performance and data integrity
2. **Add Redis** for queue management
3. **Use HTTPS** in production
4. **Set strong passwords**
5. **Configure proper backups**
6. **Use environment files** for sensitive data

## Environment File

Create a `.env` file for sensitive configuration:

```bash
# Copy and modify the example
cp .env.example .env
```

Then update the `docker-compose.yml` to use the `.env` file:

```yaml
env_file:
  - .env
```
