exports.handler = async (event) => {

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

if (event.httpMethod === "OPTIONS") {
  return {
    statusCode: 200,
    headers
  };
}

const playlistId = event.queryStringParameters.playlistId;
const action = event.queryStringParameters.action;

if (!playlistId) {
  return {
    statusCode: 400,
    headers,
    body: JSON.stringify({ error: "Missing playlistId" })
  };
}

try {

if (action === "getPlaylistTitle") {

const url = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
const res = await fetch(url);
const text = await res.text();

const match = text.match(/<title>(.*?)<\/title>/);

let title = "YouTube Playlist";

if (match && match[1]) {
  title = match[1];
}

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({ title })
};

}

return {
  statusCode: 400,
  headers,
  body: JSON.stringify({ error: "Invalid action" })
};

} catch (err) {

return {
  statusCode: 500,
  headers,
  body: JSON.stringify({ error: err.message })
};

}

};
