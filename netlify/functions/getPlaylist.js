const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const playlistId = event.queryStringParameters.id;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const maxResults = 50; // Ορίζουμε εδώ τον μέγιστο αριθμό βίντεο

  if (!playlistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Playlist ID is required' }),
    };
  }

  const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;

  try {
    const response = await fetch(url );
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return {
        statusCode: data.error.code || 500,
        body: JSON.stringify({ error: data.error.message }),
      };
    }

    // Μετατρέπουμε τα δεδομένα στη μορφή που περιμένει ο player σας
    const formattedData = data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : `https://img.youtube.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`
    } ));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Επιτρέπει την κλήση από οποιοδήποτε domain (π.χ. το blogger)
      },
      body: JSON.stringify(formattedData),
    };

  } catch (error) {
    console.error('Server Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch playlist' }),
    };
  }
};
