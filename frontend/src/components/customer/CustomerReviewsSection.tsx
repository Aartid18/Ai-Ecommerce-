import React, { useState } from 'react';
import { Star, ShieldCheck, ThumbsUp, Quote, CheckCircle2, Award } from 'lucide-react';

interface ReviewItem {
  id: number;
  author: string;
  role: string;
  avatar: string;
  rating: number;
  productName: string;
  headline: string;
  comment: string;
  verified: boolean;
  date: string;
  helpfulCount: number;
}

const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 1,
    author: 'Vikram Mehta',
    role: 'Principal Systems Architect',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Lenovo ThinkPad X1 Carbon Gen 11',
    headline: 'Unrivaled typing feel & battery endurance for engineering workflows',
    comment: 'The OLED display paired with 32GB RAM makes heavy Docker instances and IDE compile runs effortless. Shipped within 24 hours with exact live telemetry tracking.',
    verified: true,
    date: '3 days ago',
    helpfulCount: 28,
  },
  {
    id: 2,
    author: 'Ananya Sharma',
    role: 'Product Lead & Trail Runner',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Apple Watch Ultra 2 (Titanium)',
    headline: 'The GPS accuracy and bright outdoor display are unmatched',
    comment: 'Dual-frequency GPS tracked perfectly through remote mountain trails. The battery easily lasted an entire 3-day weekend run with cellular tracking active.',
    verified: true,
    date: '1 week ago',
    helpfulCount: 41,
  },
  {
    id: 3,
    author: 'Karan Dave',
    role: 'Audio Engineer & Producer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    productName: 'Bose QuietComfort Ultra Headphones',
    headline: 'Breakthrough spatial acoustics and top-tier noise isolation',
    comment: 'Deep sub-bass response without distortion. Setting a Price Watch alert saved me ₹3,500 automatically when the price dropped. Exceptional customer experience.',
    verified: true,
    date: '2 weeks ago',
    helpfulCount: 19,
  },
];

export const CustomerReviewsSection: React.FC = () => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = filterRating
    ? REVIEWS_DATA.filter((r) => r.rating === filterRating)
    : REVIEWS_DATA;

  return (
    <section className="space-y-8 pt-4">
      {/* Header & Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-black/[0.06]">
        <div className="space-y-2 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-crimson/10 text-brand-crimson text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>Verified Customer Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif text-txt-primary">
            Trusted by creators, founders, and engineers.
          </h2>
          <p className="text-xs sm:text-sm text-txt-secondary leading-relaxed">
            Real feedback from verified purchasers backed by automated logistics and authenticity checks.
          </p>
        </div>

        {/* Global Rating Scorecard */}
        <div className="flex items-center gap-6 p-5 rounded-3xl bg-white border border-black/[0.08] shadow-prem-sm self-start md:self-auto">
          <div className="text-center pr-6 border-r border-black/[0.08]">
            <div className="text-3xl sm:text-4xl font-black text-txt-primary font-serif">4.9</div>
            <div className="flex items-center justify-center gap-0.5 text-brand-gold my-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <div className="text-[10px] text-txt-muted font-medium">940+ Reviews</div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-txt-secondary">
              <span className="w-8 font-medium">5 ★</span>
              <div className="w-24 bg-[#FAF7F2] h-2 rounded-full overflow-hidden">
                <div className="bg-brand-crimson h-full rounded-full w-[88%]" />
              </div>
              <span className="text-[10px] font-mono text-txt-muted">88%</span>
            </div>
            <div className="flex items-center gap-2 text-txt-secondary">
              <span className="w-8 font-medium">4 ★</span>
              <div className="w-24 bg-[#FAF7F2] h-2 rounded-full overflow-hidden">
                <div className="bg-brand-crimson h-full rounded-full w-[10%]" />
              </div>
              <span className="text-[10px] font-mono text-txt-muted">10%</span>
            </div>
            <div className="flex items-center gap-2 text-txt-secondary">
              <span className="w-8 font-medium">3 ★</span>
              <div className="w-24 bg-[#FAF7F2] h-2 rounded-full overflow-hidden">
                <div className="bg-brand-crimson h-full rounded-full w-[2%]" />
              </div>
              <span className="text-[10px] font-mono text-txt-muted">2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            className="prem-card p-6 sm:p-7 rounded-3xl bg-white border border-black/[0.08] shadow-prem-sm hover:shadow-prem-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              {/* Star Rating & Verified Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-brand-gold">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                {review.verified && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2A7B4C] bg-[#2A7B4C]/10 border border-[#2A7B4C]/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>

              {/* Product Referenced */}
              <div className="text-[11px] font-semibold text-brand-crimson line-clamp-1">
                {review.productName}
              </div>

              {/* Headline */}
              <h3 className="text-sm font-serif font-bold text-txt-primary leading-snug">
                "{review.headline}"
              </h3>

              {/* Review Text */}
              <p className="text-xs text-txt-secondary leading-relaxed line-clamp-4">
                {review.comment}
              </p>
            </div>

            {/* Author Meta */}
            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06]">
              <div className="flex items-center gap-2.5">
                <img
                  src={review.avatar}
                  alt={review.author}
                  className="w-9 h-9 rounded-full object-cover border border-black/[0.08]"
                />
                <div>
                  <div className="text-xs font-bold text-txt-primary">{review.author}</div>
                  <div className="text-[10px] text-txt-muted">{review.role}</div>
                </div>
              </div>

              <div className="text-[10px] text-txt-muted flex items-center gap-1 font-mono">
                <ThumbsUp className="w-3 h-3" /> {review.helpfulCount}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
