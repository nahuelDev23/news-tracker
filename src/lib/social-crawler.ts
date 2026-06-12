export function isSocialCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false;

  return /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Discordbot|Pinterestbot/i.test(
    userAgent,
  );
}
