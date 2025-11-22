import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

const DEFAULT_REVIEWS = [
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
    fullReview: "I recently ordered a custom desk lamp from 3Layered and I couldn't be happier with the result! The ordering process was smooth and the team was very responsive to my questions. The lamp arrived well-packaged and the quality is exceptional. The PLA+ material gives it a premium feel and the finish is flawless. The attention to detail is remarkable - every layer is perfectly aligned. The lamp is not only functional but also a beautiful piece of art on my desk. I've already recommended 3Layered to my colleagues and friends. Definitely worth every rupee!",
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
    fullReview: "As an engineering student working on my final year project, I needed a custom prototype printed with very specific dimensions. 3Layered not only met my requirements but exceeded them! The team was patient with my multiple revision requests and provided valuable suggestions to improve the design. The prototype was delivered ahead of schedule and the precision is incredible - down to 0.1mm accuracy. The ABS material they used is durable and perfect for functional testing. The pricing was very reasonable compared to other services I explored. This is a professional team that truly understands 3D printing technology. I'll definitely be using their services for future projects!",
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
    fullReview: "I purchased a Ganesha sculpture for my home temple and it's absolutely divine! The level of detail captured in the 3D print is astounding - every feature of Lord Ganesha is perfectly rendered. The PET-G material has a beautiful sheen that makes it look almost like marble. The sculpture is sturdy yet elegant, and the size is perfect for my pooja room. What impressed me most was how the team ensured the cultural and religious aspects were respected. The packaging was also excellent with proper cushioning. This is a wonderful blend of technology and tradition. I'm planning to order more sculptures for gifting purposes. Highly recommended for anyone looking for quality religious artifacts!",
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
    fullReview: "Ordered a mobile stand for my desk setup and I'm quite pleased with it. The stand is sturdy and holds my phone at the perfect angle for video calls and watching content. The design is minimalist and modern, which fits well with my workspace aesthetic. The print quality is good with smooth surfaces and no visible layer lines. Delivery was faster than expected - received it in just 3 days! The only minor issue was that the color was slightly different from what I saw on the website, hence 4 stars instead of 5. But overall, it's a solid product at a fair price. The functionality is excellent and I use it daily. Will definitely order more products from 3Layered in the future!",
  },
  {
    id: 5,
    name: "Meera Singh",
    rating: 5,
    comment: "Love the collection! The attention to detail is remarkable. These guys really know their craft.",
    date: "2 months ago",
    product: "Custom Print",
    location: "Delhi, India",
    verified: true,
    helpfulCount: 27,
    fullReview: "I'm an avid collector and when I discovered 3Layered's collection, I was thrilled! I ordered three different items and each one is a masterpiece. The detail work is incredible - from the features to the textures, everything is perfectly captured. The items are well-balanced and can stand on their own without support. The finish is professional grade and the colors are vibrant. These aren't just products; they're display-worthy collectibles. The team was also open to custom requests and helped me design a unique piece. The pricing is competitive considering the quality. As a collector, I'm extremely satisfied and have already placed another order. 3Layered has definitely earned a loyal customer!",
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
    fullReview: "I had a unique design idea but wasn't sure how to bring it to life. The 3Layered team was incredibly helpful throughout the entire process. They reviewed my initial sketches, provided CAD modeling assistance, and suggested design modifications to make it more print-friendly and structurally sound. The communication was excellent - they sent me preview renders and updates at each stage. When the final product arrived, I was blown away! The print quality exceeded my expectations and the finishing touches they added made it look professional. They used Premium PET-G which has great strength and a glossy finish. The pricing was transparent with no hidden costs. This is more than just a printing service; they're true partners in bringing your ideas to life. I've already started working with them on two more projects. Highly, highly recommended for anyone with custom printing needs!",
  },
];

export async function GET(request: NextRequest) {
  try {
    // Get reviews from database or return defaults (public endpoint)
    const { data, error } = await supabaseAdmin
      .from('home_content')
      .select('*')
      .eq('content_type', 'reviews')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching reviews:', error);
    }

    const reviews = data?.content ? JSON.parse(data.content) : DEFAULT_REVIEWS;

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error('Get reviews error:', error);
    return NextResponse.json({ reviews: DEFAULT_REVIEWS });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviews } = await request.json();

    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json({ error: 'Invalid reviews data' }, { status: 400 });
    }

    // Upsert reviews in database
    const { error } = await supabaseAdmin
      .from('home_content')
      .upsert({
        content_type: 'reviews',
        content: JSON.stringify(reviews),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'content_type'
      });

    if (error) {
      console.error('Error saving reviews:', error);
      return NextResponse.json({ error: 'Failed to save reviews' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reviews saved successfully' });
  } catch (error: any) {
    console.error('Save reviews error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

