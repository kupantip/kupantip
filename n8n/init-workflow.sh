#!/bin/sh

# Wait for n8n to be ready
echo "Waiting for n8n to start..."
sleep 10

# Check if workflow already exists
WORKFLOW_COUNT=$(n8n list:workflow | grep -c "AI Summary Post" || true)

if [ "$WORKFLOW_COUNT" -eq "0" ]; then
    echo "Importing AI Summary Post workflow..."
    n8n import:workflow --input=/home/node/workflows/ai-summary-workflow.json
    echo "Workflow imported successfully!"
else
    echo "AI Summary Post workflow already exists, skipping import."
fi

echo "Workflow initialization complete!"
