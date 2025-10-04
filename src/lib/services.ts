import { supabase, type Service } from './supabase';

export const fetchActiveServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    console.error('Error fetching services:', error);
    throw error;
  }

  return data || [];
};

export const getServiceById = async (id: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching service:', error);
    throw error;
  }

  return data;
};

export const getServiceByName = async (name: string): Promise<Service | null> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('name', name)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching service by name:', error);
    throw error;
  }

  return data;
};

export const groupServicesByCategory = (services: Service[]) => {
  return services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
};
