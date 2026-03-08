/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { domains: ['avatars.githubusercontent.com', 'ui-avatars.com'] },
  experimental: { typedRoutes: true },
};
export default nextConfig;
