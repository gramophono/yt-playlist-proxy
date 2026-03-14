const fetch = require("node-fetch");

exports.handler = async (event) => {

  const API_KEY = process.env.YOUTUBE_API_KEY;

  const action = event.queryStringParameters.action;
  const playlistId = event.queryStringParameters.playlistId;

  try {

    // ===============================
    // GET PLAYLIST TITLE
    // ===============================
    if (action === "getPlaylistTitle") {

      const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      const title =
        data.items &&
        data.items.length > 0
          ? data.items[0].snippet.title
          : "Άγνωστη Playlist";

      return {
        statusCode: 200,
        body: JSON.stringify({ title })
      };
    }

    // ===============================
    // GET PLAYLIST VIDEOS
    // ===============================
    if (action === "getPlaylist") {

      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      const songs = data.items.map(item => ({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails.medium.url
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({
          playlistTitle: data.items[0].snippet.channelTitle,
          songs
        })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid action" })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };

  }
};
