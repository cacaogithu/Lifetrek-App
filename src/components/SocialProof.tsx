import { Star, Users, Award, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
export const SocialProof = () => {
  const {
    t
  } = useLanguage();
  const proofPoints = [{
    icon: Users,
    value: '30+',
    label: 'Manufacturing Partners',
    color: 'text-primary'
  }, {
    icon: Star,
    value: '4.9/5',
    label: 'Client Satisfaction',
    color: 'text-accent'
  }, {
    icon: Award,
    value: 'ISO 13485',
    label: 'Certified Quality',
    color: 'text-accent-orange'
  }, {
    icon: TrendingUp,
    value: '30+',
    label: 'Years Experience',
    color: 'text-primary'
  }];
  return <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-accent-orange/5 py-8 border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {proofPoints.map((point, index) => {})}
        </div>
      </div>
    </div>;
};