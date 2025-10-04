import { supabase, type Testimonial } from './supabase';

export const fetchApprovedTestimonials = async (): Promise<Testimonial[]> => {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }

  return data || [];
};

interface CreateTestimonialData {
  customerName: string;
  content: string;
  rating: number;
}

export const submitTestimonial = async (data: CreateTestimonialData) => {
  const { data: testimonial, error } = await supabase
    .from('testimonials')
    .insert({
      customer_name: data.customerName,
      content: data.content,
      rating: data.rating,
      is_approved: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error submitting testimonial:', error);
    throw error;
  }

  return testimonial;
};
