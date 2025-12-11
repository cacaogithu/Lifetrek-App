import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useBlogPosts, useBlogCategories } from "@/hooks/useBlogPosts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts(true);
  const { data: categories } = useBlogCategories();

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <>
      <Helmet>
        <title>Blog | Lifetrek Medical - Artigos sobre Implantes e Manufatura Médica</title>
        <meta
          name="description"
          content="Artigos e notícias sobre fabricação de implantes médicos, ortopédicos e dentários. Tendências da indústria, regulamentação ANVISA e inovações em manufatura de precisão."
        />
        <meta
          name="keywords"
          content="implantes médicos blog, fabricação implantes, ANVISA regulamentação, implantes ortopédicos, implantes dentários, manufatura CNC"
        />
        <link rel="canonical" href="https://lifetrekmedical.com.br/blog" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog Lifetrek Medical",
            description: "Artigos sobre fabricação de implantes médicos e manufatura de precisão",
            url: "https://lifetrekmedical.com.br/blog",
            publisher: {
              "@type": "Organization",
              name: "Lifetrek Medical",
              logo: {
                "@type": "ImageObject",
                url: "https://lifetrekmedical.com.br/logo.png",
              },
            },
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Blog Lifetrek Medical
              </h1>
              <p className="text-lg text-muted-foreground">
                Insights, tendências e novidades sobre fabricação de implantes médicos, 
                regulamentação e inovações em manufatura de precisão.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <section className="py-8 border-b border-border">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  Todos
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}>
                    <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
                      {post.featured_image && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardHeader>
                        {post.category && (
                          <Badge variant="secondary" className="w-fit mb-2">
                            {post.category.name}
                          </Badge>
                        )}
                        <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {post.published_at
                              ? format(new Date(post.published_at), "d MMM yyyy", { locale: ptBR })
                              : format(new Date(post.created_at), "d MMM yyyy", { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {estimateReadTime(post.content)} min
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3">
                          {post.excerpt || post.content.slice(0, 150)}...
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-primary font-medium group-hover:gap-3 transition-all">
                          Ler mais <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Em breve, novos artigos!
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Estamos preparando conteúdo de qualidade sobre fabricação de implantes médicos 
                  e inovações em manufatura de precisão.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Blog;
