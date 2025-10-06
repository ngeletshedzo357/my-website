export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export const fetchApprovedTestimonials = async (): Promise<Testimonial[]> => {
  return Promise.resolve([]);
};

interface CreateTestimonialData {
  customerName: string;
  content: string;
  rating: number;
}

export const submitTestimonial = async (data: CreateTestimonialData) => {
  const testimonial = {
    id: Date.now().toString(),
    customer_name: data.customerName,
    content: data.content,
    rating: data.rating,
    is_approved: false,
    created_at: new Date().toISOString(),
  };

  console.log('Testimonial submitted:', testimonial);

  return testimonial;
};
