let BASE_URL = 'http://3.72.104.209:3000';

// Fetch from S3 and update BASE_URL
const fetchBaseUrl = async () => {
  try {
    const response = await fetch(
      'https://bitload4u.s3.eu-central-1.amazonaws.com/env.js',
    );

    if (response.ok) {
      const content = await response.text();
      const match = content.match(/BASE_URL\s*=\s*['"`]([^'"`]+)['"`]/);

      if (match) {
        BASE_URL = match[1];
        console.log('BASE_URL updated:', BASE_URL);
      }
    }
  } catch (error) {
    console.warn('Failed to fetch BASE_URL from S3, using fallback:', error);
  }
};

// Initialize on import
fetchBaseUrl();

export default BASE_URL;
