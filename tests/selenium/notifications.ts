import nodemailer from 'nodemailer';
import { Octokit } from '@octokit/rest';

interface NotificationOptions {
  type: 'email' | 'github';
  subject: string;
  body: string;
  attachments?: string[];
}

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// GitHub client setup
const githubClient = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function sendNotification(options: NotificationOptions): Promise<void> {
  const { type, subject, body, attachments } = options;

  switch (type) {
    case 'email':
      await sendEmailNotification(subject, body, attachments);
      break;
    case 'github':
      await createGitHubIssue(subject, body);
      break;
    default:
      throw new Error(`Unsupported notification type: ${type}`);
  }
}

async function sendEmailNotification(subject: string, body: string, attachments?: string[]): Promise<void> {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: process.env.NOTIFICATION_EMAIL,
    subject,
    text: body,
    attachments: attachments?.map(path => ({ path })),
  };

  await emailTransporter.sendMail(mailOptions);
}

async function createGitHubIssue(subject: string, body: string): Promise<void> {
  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
  
  await githubClient.issues.create({
    owner,
    repo,
    title: subject,
    body,
    labels: ['test-failure', 'automated'],
  });
} 