export default function handler(req, res) {
  const posts = [
    {
      id: 1,
      title: "Beautiful Sunset",
      description: "A gorgeous sunset by the beach.",
      image: "https://picsum.photos/400/300?random=1",
    },
    {
      id: 2,
      title: "City Lights",
      description: "Night view of the bustling city.",
      image: "https://picsum.photos/400/300?random=2",
    },
    {
      id: 3,
      title: "Mountain Hiking",
      description: "Adventure in the mountains.",
      image: "https://picsum.photos/400/300?random=3",
    },
    {
      id: 4,
      title: "Cozy Coffee",
      description: "Relaxing with a cup of coffee.",
      image: "https://picsum.photos/400/300?random=4",
    },
    
  ];

  res.status(200).json(posts);
}
