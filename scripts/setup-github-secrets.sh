#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "https://cli.github.com/manual/installation"
    exit 1
fi

# Check if user is logged in to GitHub
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub first:"
    echo "gh auth login"
    exit 1
fi

# Get repository name
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [ -z "$REPO" ]; then
    echo "Could not determine repository name. Are you in a git repository?"
    exit 1
fi

# Function to prompt for secret value
get_secret() {
    local name=$1
    local description=$2
    local is_password=$3
    
    echo -n "Enter $description: "
    if [ "$is_password" = "true" ]; then
        read -s value
        echo
    else
        read value
    fi
    
    # Set the secret
    echo "$value" | gh secret set "$name" -R "$REPO"
    echo "✓ Set $name"
}

# Set up secrets
echo "Setting up GitHub secrets for $REPO"
echo "----------------------------------------"

# Application URL
get_secret "TEST_BASE_URL" "Application URL (e.g., https://app.nutrivision.com)"

# Notification settings
get_secret "NOTIFICATION_EMAIL" "Email for test failure notifications"
get_secret "NOTIFICATION_TYPE" "Notification type (email/github)"

# SMTP settings (if using email notifications)
echo -n "Do you want to set up email notifications? (y/n): "
read use_email
if [ "$use_email" = "y" ]; then
    get_secret "SMTP_HOST" "SMTP server host"
    get_secret "SMTP_PORT" "SMTP port (usually 587)"
    get_secret "SMTP_SECURE" "SMTP secure (true/false)"
    get_secret "SMTP_USER" "SMTP username"
    get_secret "SMTP_PASS" "SMTP password" "true"
    get_secret "SMTP_FROM" "Sender email address"
fi

# GitHub settings (if using GitHub notifications)
echo -n "Do you want to set up GitHub issue notifications? (y/n): "
read use_github
if [ "$use_github" = "y" ]; then
    get_secret "GITHUB_TOKEN" "GitHub token with issue creation permissions" "true"
fi

echo "----------------------------------------"
echo "✓ All secrets have been set up!"
echo "You can verify the secrets in your repository's Settings > Secrets and variables > Actions" 