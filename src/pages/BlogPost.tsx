import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { useBlogAnalytics } from "@/hooks/useBlogAnalytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, ArrowLeft, Share2, Tag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const { trackCtaClick } = useBlogAnalytics(post?.id);

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.seo_description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copiado para a área de transferência!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Artigo não encontrado</h1>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} | Lifetrek Medical Blog</title>
        <meta name="description" content={post.seo_description || post.excerpt || post.content.slice(0, 160)} />
        {post.keywords && <meta name="keywords" content={post.keywords.join(", ")} />}
        <link rel="canonical" href={`https://lifetrekmedical.com.br/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt || post.content.slice(0, 160)} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://lifetrekmedical.com.br/blog/${post.slug}`} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo_title || post.title} />
        <meta name="twitter:description" content={post.seo_description || post.excerpt || post.content.slice(0, 160)} />
        {post.featured_image && <meta name="twitter:image" content={post.featured_image} />}
        
        {/* Article Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.seo_description || post.excerpt,
            image: post.featured_image,
            author: {
              "@type": "Person",
              name: post.author_name,
            },
            publisher: {
              "@type": "Organization",
              name: "Lifetrek Medical",
              logo: {
                "@type": "ImageObject",
                url: "https://lifetrekmedical.com.br/logo.png",
              },
            },
            datePublished: post.published_at || post.created_at,
            dateModified: post.updated_at,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://lifetrekmedical.com.br/blog/${post.slug}`,
            },
          })}
        </script>
      </Helmet>

      <article className="min-h-screen bg-background">
        {/* Header */}
        <header className="py-8 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Link>

            {post.category && (
              <Badge variant="secondary" className="mb-4">
                {post.category.name}
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {post.published_at
                  ? format(new Date(post.published_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : format(new Date(post.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {estimateReadTime(post.content)} min de leitura
              </span>
              <span>Por {post.author_name}</span>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="container mx-auto px-4 max-w-4xl py-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="container mx-auto px-4 max-w-4xl py-8">
          <div
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Generated Notice */}
          {post.ai_generated && (
            <div className="mt-8 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>
                Este artigo foi gerado com auxílio de inteligência artificial e revisado pela equipe Lifetrek Medical.
              </p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <section className="py-16 bg-primary/5">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Precisa de implantes médicos de alta precisão?
            </h2>
            <p className="text-muted-foreground mb-8">
              Entre em contato para discutir seu projeto e descobrir como podemos ajudar.
            </p>
            <Link to="/contact" onClick={() => trackCtaClick()}>
              <Button size="lg">Fale Conosco</Button>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
};

export default BlogPost;
