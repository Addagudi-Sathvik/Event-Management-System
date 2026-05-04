const axios = require("axios");

module.exports = async function fetchUnsplashImage(query = "event conference stage") {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
  }

  const { data } = await axios.get("https://api.unsplash.com/photos/random", {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    },
    params: {
      query,
      orientation: "landscape",
    },
    timeout: 8000,
  });

  return data?.urls?.regular || `https://source.unsplash.com/1600x900/?${encodeURIComponent(query)}`;
};
