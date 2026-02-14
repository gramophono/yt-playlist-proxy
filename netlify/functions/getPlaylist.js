const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const playlistId = event.queryStringParameters.id;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const maxResults = 50;

  if (!playlistId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Playlist ID is required' }) };
  }

  // URL για τα βίντεο της playlist
  const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;
  
  // URL για τις πληροφορίες της ίδιας της playlist (για να πάρουμε τον τίτλο )
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`;

  try {
    // Εκτελούμε τις δύο κλήσεις ταυτόχρονα για ταχύτητα
    const [itemsResponse, playlistResponse] = await Promise.all([
      fetch(itemsUrl ),
      fetch(playlistUrl)
    ]);

    const itemsData = await itemsResponse.json();
    const playlistData = await playlistResponse.json();

    // Έλεγχος για σφάλματα σε οποιαδήποτε από τις δύο κλήσεις
    if (itemsData.error || playlistData.error) {
      const error = itemsData.error || playlistData.error;
      console.error('YouTube API Error:', error);
      return { statusCode: error.code || 500, body: JSON.stringify({ error: error.message }) };
    }

    // Παίρνουμε τον τίτλο από τη δεύτερη κλήση
    const playlistTitle = playlistData.items.length > 0 ? playlistData.items[0].snippet.title : "Άγνωστη Playlist";

    // Φτιάχνουμε τη λίστα με τα βίντεο από την πρώτη κλήση
    const videoItems = itemsData.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium ? item.snippet.thumbnails.medium.url : `https://img.youtube.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`
    } ));

    // Συνδυάζουμε τα πάντα σε ένα αντικείμενο
    const responsePayload = {
      playlistTitle: playlistTitle,
      items: videoItems
    };

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(responsePayload),
    };

  } catch (error) {
    console.error('Server Error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch playlist' }) };
  }
};
