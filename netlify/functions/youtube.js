// netlify/functions/youtube.js
exports.handler = async (event) => {
  // CORS headers για να λειτουργεί από οποιοδήποτε domain
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const { action, playlistId } = params;

    if (!action || !playlistId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing parameters' })
      };
    }

    // YouTube API key - ΒΑΛΕ ΤΟ ΔΙΚΟ ΣΟΥ API KEY ΕΔΩ
    const YOUTUBE_API_KEY = 'AIzaSyC52fEfReuH9qYi0uPN6A2UyBm_Dg0d-6E';

    if (action === 'getPlaylistTitle') {
      // Fetch playlist details
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Playlist not found' })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: data.items[0].snippet.title
        })
      };
    }

    if (action === 'getPlaylist') {
      // Fetch playlist items
      let allItems = [];
      let nextPageToken = '';
      
      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
          allItems = [...allItems, ...data.items];
        }

        nextPageToken = data.nextPageToken;
      } while (nextPageToken);

      // Get playlist title
      const playlistResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${YOUTUBE_API_KEY}`
      );
      const playlistData = await playlistResponse.json();
      const playlistTitle = playlistData.items?.[0]?.snippet?.title || 'YouTube Playlist';

      // Transform items
      const songs = allItems
        .filter(item => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
        .map((item, index) => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
          position: index + 1
        }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          playlistTitle,
          songs
        })
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid action' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};
