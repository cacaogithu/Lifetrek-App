import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Blog() {
  const { t } = useLanguage();

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Medical Device Manufacturing",
      date: "January 14, 2026",
      excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      id: 2,
      title: "The Importance of ISO 13485 Certification",
      date: "January 7, 2026",
      excerpt: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">{t("blog.title")}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-500 mb-4">{post.date}</p>
            <p className="text-gray-700 mb-4">{post.excerpt}</p>
            <Link to={`/blog/${post.id}`}>
              <Button variant="link">{t("blog.readMore")}</Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
