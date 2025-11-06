# How to Link Your Custom Nodes to an n8n Instance

## If You’re Using n8n on Your Host Machine

1. Install n8n globally:

   ```bash
   npm install -g n8n
   ```

2. Run the `n8n` command once to create the `~/.n8n` folder.

3. Publish your custom nodes (only needed once):

   ```bash
   npm link
   ```

4. Link your custom nodes to n8n:

   ```bash
   mkdir -p ~/.n8n/custom && cd ~/.n8n/custom
   npm init -y
   npm link n8n-nodes-g-portal
   ```
