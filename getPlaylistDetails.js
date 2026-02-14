const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Αντί για ένα ID, περιμένουμε μια λίστα από IDs χωρισμένα με κόμμα
  const playlistIds = event.queryStringParameters.ids;
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!playlistIds) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Playlist IDs are required' }) };
  }

  // Το YouTube API μπορεί να δεχτεί πολλά IDs ταυτόχρονα (έως 50)
  const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistIds}&key=${apiKey}`;

  try {
    const response = await fetch(url );
    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return { statusCode: data.error.code || 500, body: JSON.stringify({ error: data.error.message }) };
    }

    // Μετατρέπουμε την απάντηση σε μια απλή λίστα με ID και τίτλο
    const details = data.items.map(item => ({
      id: item.id,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url // Παίρνουμε και μια μικρογραφία
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(details),
    };

  } catch (error) {
    console.error('Server Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch playlist details' }) };
  }
};
