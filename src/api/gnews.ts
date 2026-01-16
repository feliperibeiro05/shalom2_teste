import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function (req: VercelRequest, res: VercelResponse) {
  const { query, category } = req.query;

  // Use a chave de API da GNews de uma variável de ambiente por segurança
  const apiKey = process.env.GNEWS_API_KEY; 

  if (!apiKey) {
    return res.status(500).send('API Key not configured');
  }

  // Monta a URL da API da GNews
  const apiUrl = `https://gnews.io/api/v4/top-headlines?category=${category}&q=${query}&lang=pt&country=br&token=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`GNews API returned an error: ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data.articles);
  } catch (error) {
    console.error('Error fetching news from GNews:', error);
    res.status(500).send('Failed to fetch news from API');
  }
}