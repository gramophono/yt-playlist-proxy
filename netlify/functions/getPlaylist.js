const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const playlistId = event.queryStringParameters.id;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const maxResults = 50;

  if (!playlistId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Playlist ID is required' }) };
  }

  const itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`;

  try {

    const itemsResponse = await fetch(itemsUrl);
    const itemsData = await itemsResponse.json();

    if (itemsData.error) {
      console.error('YouTube API Error:', itemsData.error);
      return { statusCode: itemsData.error.code || 500, body: JSON.stringify({ error: itemsData.error.message }) };
    }

    // Παίρνουμε τίτλο playlist από το πρώτο item
    const playlistTitle = itemsData.items?.[0]?.snippet?.playlistTitle || "Άγνωστη Playlist";

    const videoItems = itemsData.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium
        ? item.snippet.thumbnails.medium.url
        : `https://img.youtube.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`
    }));

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
