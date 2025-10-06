import { services } from '@/data/services';
import type { Service } from '@/data/services';

export type { Service };

export const fetchActiveServices = async (): Promise<Service[]> => {
  return Promise.resolve(services);
};

export const getServiceById = (id: string): Service | undefined => {
  return services.find(s => s.id === id);
};

export const getServiceByName = (name: string): Service | undefined => {
  return services.find(s => s.name === name);
};

export const groupServicesByCategory = (serviceList: Service[]) => {
  return serviceList.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, Service[]>);
};
