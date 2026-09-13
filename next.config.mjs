/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/resources/call-recordings/coaching-calls',
        destination: '/resources/call-recordings/weekly-coaching',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
