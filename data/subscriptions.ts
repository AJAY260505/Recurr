export interface Service {
  name: string;
  image: string;
}

interface GroupedServices {
  group: string;
  services: Service[];
}

export const groupedServices: GroupedServices[] = [
  {
    group: 'Entertainment',
    services: [
      { name: 'Netflix', image: '/logos/netflix.svg' },
      { name: 'YouTube Premium', image: '/logos/youtube.svg' },
      { name: 'Prime Video', image: '/logos/prime-video.svg' },
      { name: 'Hotstar', image: '/logos/hotstar.svg' },
      { name: 'JioCinema', image: '/logos/jio-cinema.svg' },
    ],
  },
  {
    group: 'Music',
    services: [
      { name: 'Spotify', image: '/logos/spotify.svg' },
      { name: 'Apple Music', image: '/logos/apple-music.svg' },
      { name: 'YouTube Music', image: '/logos/youtube-music.svg' },
    ],
  },
  {
    group: 'AI Services',
    services: [
      { name: 'ChatGPT', image: '/logos/chatgpt.svg' },
      { name: 'OpenAI', image: '/logos/openai.svg' },
      { name: 'Claude', image: '/logos/claude-ai.svg' },
      { name: 'Gemini', image: '/logos/gemini.svg' },
    ],
  },
  {
    group: 'Cloud Services',
    services: [
      { name: 'Google Cloud', image: '/logos/google.svg' },
      { name: 'AWS', image: '/logos/aws.svg' },
      { name: 'Azure', image: '/logos/azure.svg' },
      { name: 'Digital Ocean', image: '/logos/digitalocean.svg' },
      { name: 'Vercel', image: '/logos/vercel.svg' },
    ],
  },
  {
    group: 'Software',
    services: [
      { name: 'Adobe', image: '/logos/adobe.svg' },
      { name: 'Canva', image: '/logos/canva.svg' },
      { name: 'Figma', image: '/logos/figma.svg' },
      { name: 'Zoom', image: '/logos/zoom.svg' },
      { name: 'Slack', image: '/logos/slack.svg' },
      { name: 'Notion', image: '/logos/notion.svg' },
      { name: 'Linear', image: '/logos/linear.svg' },
      { name: 'Cursor', image: '/logos/cursor.png' },
    ],
  },
];