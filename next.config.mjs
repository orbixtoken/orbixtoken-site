const nextConfig = {
    async headers() {
      return [
        {
          source: "/(.*)",
          headers: [
            {
              key: "Content-Security-Policy",
              value: "script-src 'self' 'unsafe-inline';",
            },
          ],
        },
      ];
    },
  };
  
  export default nextConfig;
  