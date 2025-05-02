import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowRight, DollarSign, Calendar, MapPin, Award, ChevronLeft, GraduationCap, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scholarship, Level, Country } from '@shared/schema';

const FeaturedScholarships = () => {
  const { data: scholarships, isLoading, error } = useQuery<Scholarship[]>({
    queryKey: ['/api/scholarships/featured'],
  });

  const { data: levels } = useQuery<Level[]>({
    queryKey: ['/api/levels'],
  });

  const { data: countries } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  const getCountryName = (countryId: number | null | undefined) => {
    if (!countryId || !countries) return '';
    const country = countries.find(c => c.id === countryId);
    return country?.name || '';
  };

  const getLevelName = (levelId: number | null | undefined) => {
    if (!levelId || !levels) return '';
    const level = levels.find(l => l.id === levelId);
    return level?.name || '';
  };

  if (isLoading) {
    return (
      <section className="bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold sm:text-4xl">المنح الدراسية المميزة</h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">اكتشف أفضل فرص المنح الدراسية المتاحة حاليًا لمختلف المستويات والتخصصات</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse overflow-hidden border-0 shadow-md">
                <div className="h-48 bg-muted"></div>
                <CardContent className="p-6">
                  <div className="h-5 w-24 rounded-full bg-muted"></div>
                  <div className="mt-3 h-7 w-4/5 rounded bg-muted"></div>
                  <div className="mt-3 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-2 h-4 w-full rounded bg-muted"></div>
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 w-24 rounded-full bg-muted"></div>
                    <div className="h-6 w-24 rounded-full bg-muted"></div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
                  <div className="h-5 w-32 rounded bg-muted"></div>
                  <div className="h-5 w-24 rounded bg-muted"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !scholarships) {
    return (
      <section className="bg-gradient-to-b from-background to-muted/30 py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">المنح الدراسية المميزة</h2>
            <p className="mx-auto mb-6 max-w-xl text-muted-foreground">فشل في تحميل المنح الدراسية. يرجى المحاولة مرة أخرى لاحقاً.</p>
            <Button variant="outline" onClick={() => window.location.reload()}>إعادة المحاولة</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-background to-muted/30 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">المنح الدراسية المميزة</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">اكتشف أفضل فرص المنح الدراسية المتاحة حاليًا لمختلف المستويات والتخصصات</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {scholarships.map((scholarship) => (
            <Card key={scholarship.id} className="group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="relative overflow-hidden">
                <div className="image-hover">
                  <img 
                    src={scholarship.imageUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3"}
                    alt={scholarship.title}
                    className="h-52 w-full object-cover transition-transform duration-500"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                
                {/* Badges */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary/90 text-xs font-medium text-white hover:bg-primary">
                      <GraduationCap className="mr-1 h-3 w-3" /> {getLevelName(scholarship.levelId)}
                    </Badge>
                    
                    <Badge className="bg-accent/90 text-xs font-medium text-white hover:bg-accent">
                      <MapPin className="mr-1 h-3 w-3" /> {getCountryName(scholarship.countryId)}
                    </Badge>
                  </div>
                  
                  {scholarship.isFullyFunded && (
                    <Badge className="bg-green-600/90 text-xs font-medium text-white">
                      <Award className="mr-1 h-3 w-3" /> تمويل كامل
                    </Badge>
                  )}
                </div>
                
                {/* Deadline sticker */}
                {scholarship.deadline && (
                  <div className="absolute -left-12 top-5 transform rotate-[-45deg] bg-primary py-1 px-12 text-center text-xs font-semibold text-white shadow-md">
                    <span className="block transform rotate-[0deg]">الموعد النهائي: {scholarship.deadline}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <h3 className="mb-3 text-xl font-bold transition-colors group-hover:text-primary">
                  <Link href={`/scholarships/${scholarship.slug}`} className="block">
                    {scholarship.title}
                  </Link>
                </h3>
                
                <p className="mb-4 text-sm text-muted-foreground line-clamp-3">
                  {scholarship.description}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {scholarship.deadline && (
                    <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Calendar className="mr-1 h-3 w-3" /> {scholarship.deadline}
                    </div>
                  )}
                  
                  <div className="flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    <DollarSign className="mr-1 h-3 w-3" /> {scholarship.amount || 'قيمة متغيرة'}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex items-center justify-between border-t bg-muted/10 p-4">
                <Link href={`/scholarships/${scholarship.slug}`}>
                  <Button variant="ghost" size="sm" className="group/btn gap-1 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary">
                    تفاصيل المنحة
                    <ChevronLeft className="h-4 w-4 transform transition-transform group-hover/btn:-translate-x-1" />
                  </Button>
                </Link>
                
                {scholarship.applicationLink && (
                  <a href={scholarship.applicationLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="gap-1 bg-accent/90 text-xs font-medium text-white hover:bg-accent">
                      التقديم
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/scholarships">
            <Button variant="outline" className="group mx-auto inline-flex items-center gap-2 rounded-full border-primary px-6 py-2 font-medium text-primary hover:bg-primary hover:text-white">
              عرض جميع المنح الدراسية
              <ArrowRight className="h-4 w-4 rotate-180 transform transition-transform group-hover:-translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedScholarships;
