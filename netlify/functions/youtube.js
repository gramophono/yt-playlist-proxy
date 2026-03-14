// youtube.js
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const { action, playlistId } = event.queryStringParameters || {};

  // Βασικός έλεγχος action
  if (!action) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing action parameter" }),
    };
  }

  if (!playlistId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing playlistId parameter" }),
    };
  }

  // YouTube API Key από Netlify Environment Variable
  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing YOUTUBE_API_KEY" }),
    };
  }

  try {
    if (action === "getPlaylistTitle") {
      // Παίρνει μόνο τον τίτλο της playlist
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        return { statusCode: 404, body: JSON.stringify({ error: "Playlist not found" }) };
      }

      const title = data.items[0].snippet.title;
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // CORS fix
        },
        body: JSON.stringify({ title }),
      };
    }

    if (action === "getPlaylistVideos") {
      // Παίρνει μέχρι 50 βίντεο της playlist
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!data.items) {
        return { statusCode: 404, body: JSON.stringify({ error: "Videos not found" }) };
      }

      const videos = data.items.map(item => ({
        videoId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
      }));

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*", // CORS fix
        },
        body: JSON.stringify({ videos }),
      };
    }

    // Άγνωστο action
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid action" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
