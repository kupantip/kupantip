# N8n Workflow Auto-Seeding

This directory contains workflow JSON files that will be automatically imported by n8n on startup.

## How It Works

The workflow needs to be imported manually **one time only** using the n8n CLI command. After that, the workflow persists in the n8n database (stored in `n8n/data/`).

### Quick Import Command

Run this command to import the workflow:

```bash
docker exec kupantip-n8n n8n import:workflow --input=/home/node/workflows/ai-summary-workflow.json
```

## Setup Instructions

### 1. Workflow Files

The workflow file `ai-summary-workflow.json` is already configured for AI post summarization using Google Gemini.

**Important:** After n8n imports the workflow, you must:

1. Open n8n at http://localhost:5678
2. Go to **Credentials** settings
3. Create a new **Google Gemini API** credential
4. Add your Gemini api key to credential
5. Open the imported workflow
6. Connect the Google Gemini Chat Model node to your credential
7. Activate the workflow

### 2. Webhook Configuration

The workflow uses a generic webhook path:

- **Path:** `/webhook/ai-summary`
- **Method:** POST
- **Body:** `{ post_id, title, body }`

After import, n8n will auto-generate a unique `webhookId`. The full webhook URL will be:

```
http://localhost:5678/webhook/ai-summary
```

### 3. Environment Variables

Make sure your `.env` file contains:

```env
# n8n Configuration
N8N_HOST=http://localhost:5678  # Optional, defaults to localhost:5678
```

### 4. Testing the Workflow

Once configured, test the AI summarization by calling:

```bash
GET http://localhost:8000/api/v1/n8n/post/:post_id
```

The backend will:

1. Fetch the post from the database
2. Send POST request to n8n webhook
3. N8n processes with Google Gemini AI
4. Return the AI-generated summary


## Resetting n8n for Testing

To completely reset n8n and test fresh installation:

```bash
# Stop n8n container
docker compose down n8n

# Delete all n8n data (database, credentials, workflows)
Remove-Item -Path .\n8n\data -Recurse -Force

# Start fresh n8n instance
docker compose up -d n8n

# Wait 10 seconds for n8n to initialize, then import workflow
Start-Sleep -Seconds 10
docker exec kupantip-n8n n8n import:workflow --input=/home/node/workflows/ai-summary-workflow.json
```

After reset, you need to:

1. Create Google Gemini credential again in n8n UI
2. Connect credential to the workflow
3. Activate the workflow


## Troubleshooting

**Workflow not importing:**

- Check n8n logs: `docker compose logs n8n`
- Verify JSON file is valid
- Ensure volume mount is correct in `compose.yml`

**Webhook not working:**

- Verify workflow is activated in n8n UI
- Check the webhook path matches: `/webhook/ai-summary`
- Ensure Google Gemini credential is connected

**Credential errors:**

- Credentials must be created manually in n8n UI
- Cannot be auto-seeded due to security reasons
