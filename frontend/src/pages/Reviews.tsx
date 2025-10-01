import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddReviewDialog from "@/components/AddReviewDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { EditableLayout } from "@/components/cms/EditableLayout";

const Reviews = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Pierre Martin",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-15",
      review: {
        fr: "Excellent service ! Les signaux sont très précis et m'ont permis d'améliorer considérablement mes performances de trading.",
        en: "Excellent service! The signals are very accurate and have significantly improved my trading performance."
      }
    },
    {
      id: 2,
      name: "Sarah Johnson",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2024-01-10",
      review: {
        fr: "Formation de qualité exceptionnelle. Les stratégies enseignées sont applicables immédiatement.",
        en: "Exceptional quality training. The strategies taught are immediately applicable."
      }
    },
    {
      id: 3,
      name: "Ahmed Benali",
      avatar: "/placeholder.svg",
      rating: 4,
      date: "2024-01-05",
      review: {
        fr: "Très bon accompagnement et analyses techniques détaillées. Je recommande vivement !",
        en: "Very good support and detailed technical analysis. I highly recommend!"
      }
    },
    {
      id: 4,
      name: "Marie Dubois",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2023-12-28",
      review: {
        fr: "Grâce à cette plateforme, j'ai pu passer de débutante à trader rentable en quelques mois.",
        en: "Thanks to this platform, I was able to go from beginner to profitable trader in just a few months."
      }
    },
    {
      id: 5,
      name: "Carlos Rodriguez",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2023-12-20",
      review: {
        fr: "Support client réactif et signaux de qualité. L'intégration Telegram est très pratique.",
        en: "Responsive customer support and quality signals. The Telegram integration is very convenient."
      }
    },
    {
      id: 6,
      name: "Lisa Chen",
      avatar: "/placeholder.svg",
      rating: 4,
      date: "2023-12-15",
      review: {
        fr: "Formation complète et bien structurée. Les résultats sont au rendez-vous !",
        en: "Comprehensive and well-structured training. The results are there!"
      }
    }
  ]);

  const addReview = (newReview: any) => {
    setReviews(prev => [newReview, ...prev]);
    setCurrentPage(1); // Retourner à la première page pour voir le nouvel avis
  };


  // Pagination logic
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);


  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <EditableLayout pageSlug="reviews">
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('reviews.title')}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t('reviews.subtitle')}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">{t('reviews.stats.total')}</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold text-primary">4.8/5</div>
                  <div className="text-sm text-muted-foreground">{t('reviews.stats.rating')}</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm border border-border rounded-lg px-6 py-3">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">{t('reviews.stats.satisfaction')}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Grid */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Add Review Button */}
            <div className="flex justify-center mb-12">
              <AddReviewDialog onReviewAdded={addReview} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{review.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-2" />
                      <p className="text-muted-foreground leading-relaxed pl-6">
                        {review.review[useLanguage().language]}
                      </p>
                    </div>
                    <div className="mt-4 text-xs text-primary font-medium">
                      ✓ {t('reviews.verified')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </EditableLayout>
  );
};

export default Reviews;