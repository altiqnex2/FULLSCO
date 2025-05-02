import { Link } from 'wouter';
import { 
  GraduationCap, 
  MapPin, 
  BookOpen, 
  BarChart, 
  Users, 
  Calendar 
} from 'lucide-react';

const categories = [
  {
    title: 'حسب المستوى الدراسي',
    description: 'بكالوريوس، ماجستير، دكتوراه',
    icon: GraduationCap,
    link: '/scholarships?type=degree'
  },
  {
    title: 'حسب الوجهة',
    description: 'الولايات المتحدة، المملكة المتحدة، كندا، أستراليا، أوروبا',
    icon: MapPin,
    link: '/scholarships?type=destination'
  },
  {
    title: 'حسب مجال الدراسة',
    description: 'الهندسة، الطب، الأعمال، الفنون',
    icon: BookOpen,
    link: '/scholarships?type=field'
  },
  {
    title: 'حسب نوع التمويل',
    description: 'تمويل كامل، جزئي، منح بحثية',
    icon: BarChart,
    link: '/scholarships?type=funding'
  },
  {
    title: 'حسب الأهلية',
    description: 'الطلاب الدوليين، حسب الجنسية',
    icon: Users,
    link: '/scholarships?type=eligibility'
  },
  {
    title: 'المواعيد النهائية القادمة',
    description: 'طلبات التقديم تقترب من الإغلاق',
    icon: Calendar,
    link: '/scholarships?type=deadline'
  }
];

const ScholarshipCategories = () => {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold sm:text-3xl mb-4">تصفح المنح الدراسية حسب الفئة</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">اعثر على فرص المنح الدراسية التي تتناسب مع اهتماماتك الأكاديمية، أو بلد الوجهة، أو المستوى الدراسي.</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link key={index} href={category.link}>
              <div className="group flex items-center p-4 bg-card rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
                <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white">
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <ArrowRight className="mr-auto text-muted-foreground group-hover:text-primary h-4 w-4 rotate-180" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

const ArrowRight = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default ScholarshipCategories;
