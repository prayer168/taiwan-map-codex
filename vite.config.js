export default {
  base: process.env.GITHUB_PAGES === "true" ? "/Sound_Lab/" : "./",
  server: {
    host: "127.0.0.1",
    port: 5173
  }
};
