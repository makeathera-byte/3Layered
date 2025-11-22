"use client";

import { useState } from "react";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  product?: string;
  fullReview: string;
  location?: string;
  verified: boolean;
  helpfulCount?: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    comment: "Absolutely stunning work! The desk lamp I ordered exceeded my expectations. The quality and finish are top-notch.",
    date: "2 weeks ago",
    product: "Desk Lamp",
    location: "Mumbai, India",
    verified: true,
    helpfulCount: 24,
    fullReview: "I recently ordered a custom desk lamp from 3Layered and I couldn't be happier with the result! The ordering process was smooth and the team was very responsive to my questions. The lamp arrived well-packaged and the quality is exceptional. The PLA+ material gives it a premium feel and the finish is flawless. The attention to detail is remarkable - every layer is perfectly aligned. The lamp is not only functional but also a beautiful piece of art on my desk. I've already recommended 3Layered to my colleagues and friends. Definitely worth every rupee!"
  },
  {
    id: 2,
    name: "Rahul Verma",
    rating: 5,
    comment: "Amazing custom print service! They brought my prototype to life with incredible precision. Highly recommend 3Layered!",
    date: "1 month ago",
    product: "Custom Prototype",
    location: "Bangalore, India",
    verified: true,
    helpfulCount: 31,
    fullReview: "As an engineering student working on my final year project, I needed a custom prototype printed with very specific dimensions. 3Layered not only met my requirements but exceeded them! The team was patient with my multiple revision requests and provided valuable suggestions to improve the design. The prototype was delivered ahead of schedule and the precision is incredible - down to 0.1mm accuracy. The ABS material they used is durable and perfect for functional testing. The pricing was very reasonable compared to other services I explored. This is a professional team that truly understands 3D printing technology. I'll definitely be using their services for future projects!"
  },
  {
    id: 3,
    name: "Ananya Patel",
    rating: 5,
    comment: "The Ganesha sculpture is beautifully detailed. The PET-G material gives it a premium look. Very satisfied!",
    date: "3 weeks ago",
    product: "God's Sculpture",
    location: "Ahmedabad, India",
    verified: true,
    helpfulCount: 18,
    fullReview: "I purchased a Ganesha sculpture for my home temple and it's absolutely divine! The level of detail captured in the 3D print is astounding - every feature of Lord Ganesha is perfectly rendered. The PET-G material has a beautiful sheen that makes it look almost like marble. The sculpture is sturdy yet elegant, and the size is perfect for my pooja room. What impressed me most was how the team ensured the cultural and religious aspects were respected. The packaging was also excellent with proper cushioning. This is a wonderful blend of technology and tradition. I'm planning to order more sculptures for gifting purposes. Highly recommended for anyone looking for quality religious artifacts!"
  },
  {
    id: 4,
    name: "Karthik Reddy",
    rating: 4,
    comment: "Great quality prints and fast delivery. The mobile stand is sturdy and looks modern. Will order again!",
    date: "1 week ago",
    product: "Mobile Stand",
    location: "Hyderabad, India",
    verified: true,
    helpfulCount: 12,
    fullReview: "Ordered a mobile stand for my desk setup and I'm quite pleased with it. The stand is sturdy and holds my phone at the perfect angle for video calls and watching content. The design is minimalist and modern, which fits well with my workspace aesthetic. The print quality is good with smooth surfaces and no visible layer lines. Delivery was faster than expected - received it in just 3 days! The only minor issue was that the color was slightly different from what I saw on the website, hence 4 stars instead of 5. But overall, it's a solid product at a fair price. The functionality is excellent and I use it daily. Will definitely order more products from 3Layered in the future!"
  },
  {
    id: 5,
    name: "Meera Singh",
    rating: 5,
    comment: "Love the action figures collection! The attention to detail is remarkable. These guys really know their craft.",
    date: "2 months ago",
    product: "Action Figure",
    location: "Delhi, India",
    verified: true,
    helpfulCount: 27,
    fullReview: "I'm an avid collector of action figures and when I discovered 3Layered's collection, I was thrilled! I ordered three different superhero figures and each one is a masterpiece. The detail work is incredible - from the facial features to the costume textures, everything is perfectly captured. The figures are well-balanced and can stand on their own without support. The joints are articulated and allow for different poses. The paint finish (post-processing) is professional grade and the colors are vibrant. These aren't just toys; they're display-worthy collectibles. The team was also open to custom requests and helped me design a unique figure. The pricing is competitive considering the quality. As a collector, I'm extremely satisfied and have already placed another order. 3Layered has definitely earned a loyal customer!"
  },
  {
    id: 6,
    name: "Arjun Nair",
    rating: 5,
    comment: "Fantastic experience from start to finish. The team helped me refine my design and the final product is perfect!",
    date: "3 weeks ago",
    product: "Custom Print",
    location: "Kochi, India",
    verified: true,
    helpfulCount: 20,
    fullReview: "I had a unique design idea but wasn't sure how to bring it to life. The 3Layered team was incredibly helpful throughout the entire process. They reviewed my initial sketches, provided CAD modeling assistance, and suggested design modifications to make it more print-friendly and structurally sound. The communication was excellent - they sent me preview renders and updates at each stage. When the final product arrived, I was blown away! The print quality exceeded my expectations and the finishing touches they added made it look professional. They used Premium PET-G which has great strength and a glossy finish. The pricing was transparent with no hidden costs. This is more than just a printing service; they're true partners in bringing your ideas to life. I've already started working with them on two more projects. Highly, highly recommended for anyone with custom printing needs!"
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-400"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<{ [key: number]: { helpful: number; notHelpful: number; userVote: 'helpful' | 'notHelpful' | null } }>({});

  const handleVote = (reviewId: number, voteType: 'helpful' | 'notHelpful') => {
    setHelpfulVotes(prev => {
      const current = prev[reviewId] || { helpful: 0, notHelpful: 0, userVote: null };
      
      // If user already voted the same way, remove their vote
      if (current.userVote === voteType) {
        return {
          ...prev,
          [reviewId]: {
            helpful: voteType === 'helpful' ? current.helpful - 1 : current.helpful,
            notHelpful: voteType === 'notHelpful' ? current.notHelpful - 1 : current.notHelpful,
            userVote: null
          }
        };
      }
      
      // If user voted differently before, switch their vote
      if (current.userVote) {
        return {
          ...prev,
          [reviewId]: {
            helpful: voteType === 'helpful' ? current.helpful + 1 : current.helpful - 1,
            notHelpful: voteType === 'notHelpful' ? current.notHelpful + 1 : current.notHelpful - 1,
            userVote: voteType
          }
        };
      }
      
      // New vote
      return {
        ...prev,
        [reviewId]: {
          helpful: voteType === 'helpful' ? current.helpful + 1 : current.helpful,
          notHelpful: voteType === 'notHelpful' ? current.notHelpful + 1 : current.notHelpful,
          userVote: voteType
        }
      };
    });
  };

  const getVoteData = (reviewId: number) => {
    const votes = helpfulVotes[reviewId] || { helpful: 0, notHelpful: 0, userVote: null };
    const review = reviews.find(r => r.id === reviewId);
    const baseCount = review?.helpfulCount || 0;
    
    return {
      helpful: baseCount + votes.helpful,
      notHelpful: votes.notHelpful,
      userVote: votes.userVote
    };
  };

  return (
    <div className="mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          What Our Customers Say
        </h2>
        <p className="text-moss mt-2 max-w-2xl mx-auto">
          Don't just take our word for it — hear from those who've experienced the magic of 3D printing with us.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            onClick={() => setSelectedReview(review)}
            className="glass rounded-xl p-6 hover:shadow-glow transition-all duration-300 flex flex-col cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-emerald-300 transition-colors">
                  {review.name}
                </h3>
                <p className="text-sm text-moss">{review.date}</p>
              </div>
              <StarRating rating={review.rating} />
            </div>
            
            {review.product && (
              <div className="mb-3">
                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-moss">
                  {review.product}
                </span>
              </div>
            )}
            
            <p className="text-moss leading-relaxed flex-grow overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
              "{review.comment}"
            </p>
            
            <div className="mt-3 text-sm text-emerald-300 group-hover:text-emerald-200 transition-colors">
              Click to read full review →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="glass inline-block rounded-xl px-8 py-6">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold">4.9</div>
              <StarRating rating={5} />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold">Excellent</p>
              <p className="text-sm text-moss">Based on 150+ reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedReview(null)}
          style={{ margin: 0 }}
        >
          <div
            className="bg-gradient-to-br from-emerald-50/95 to-white/95 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative shadow-2xl border border-emerald-200/50 dark:border-emerald-500/30"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.1)'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-600 transition-colors text-white z-10"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {selectedReview.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-2xl font-semibold text-slate-800 dark:text-white">{selectedReview.name}</h3>
                    {selectedReview.verified && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {selectedReview.location && (
                    <p className="text-sm text-slate-800 dark:text-slate-300 mb-2">📍 {selectedReview.location}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <StarRating rating={selectedReview.rating} />
                    <span className="text-sm text-slate-700 dark:text-slate-400">{selectedReview.date}</span>
                  </div>
                </div>
              </div>

              {selectedReview.product && (
                <div className="inline-block">
                  <span className="text-sm px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                    📦 Product: {selectedReview.product}
                  </span>
                </div>
              )}
            </div>

            {/* Full Review */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3 text-slate-800 dark:text-white">Full Review</h4>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-base">
                {selectedReview.fullReview}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="mb-4">
                <p className="text-sm text-slate-800 dark:text-slate-400 mb-2">Was this review helpful?</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <button 
                    onClick={() => handleVote(selectedReview.id, 'helpful')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                      getVoteData(selectedReview.id).userVote === 'helpful'
                        ? 'bg-emerald-500 text-white shadow-lg scale-105'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={getVoteData(selectedReview.id).userVote === 'helpful' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    Helpful ({getVoteData(selectedReview.id).helpful})
                  </button>
                  
                  <button 
                    onClick={() => handleVote(selectedReview.id, 'notHelpful')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all font-medium ${
                      getVoteData(selectedReview.id).userVote === 'notHelpful'
                        ? 'bg-red-500 text-white shadow-lg scale-105'
                        : 'bg-red-500/20 hover:bg-red-500/30 text-red-700 dark:text-red-300'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={getVoteData(selectedReview.id).userVote === 'notHelpful' ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                      />
                    </svg>
                    Not Helpful ({getVoteData(selectedReview.id).notHelpful})
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {getVoteData(selectedReview.id).helpful} {getVoteData(selectedReview.id).helpful === 1 ? 'person' : 'people'} found this helpful
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

