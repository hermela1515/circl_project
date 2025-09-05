// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["picsum.photos", "randomuser.me"], // ✅ allow both sources
  },
};

export default nextConfig;
