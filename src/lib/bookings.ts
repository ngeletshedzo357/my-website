import type { Service } from '@/data/services';

export const MINIMUM_BOOKING_AMOUNT = 50000;
export const TRAVEL_FEE_PER_KM = 1500;
export const FREE_TRAVEL_RADIUS_KM = 5;

interface CreateBookingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceAddress: string;
  bookingDate: string;
  bookingTime: string;
  services: Service[];
  paymentMethod: string;
  distanceKm?: number;
  notes?: string;
}

interface CreateBookingResult {
  success: boolean;
  booking?: {
    booking_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    service_address: string;
    booking_date: string;
    booking_time: string;
    total_amount: number;
    travel_fee: number;
    payment_method: string;
    notes: string;
  };
  error?: string;
}

export const calculateTravelFee = (distanceKm: number): number => {
  if (distanceKm <= FREE_TRAVEL_RADIUS_KM) {
    return 0;
  }
  const extraKm = distanceKm - FREE_TRAVEL_RADIUS_KM;
  return Math.ceil(extraKm) * TRAVEL_FEE_PER_KM;
};

export const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK${timestamp}${random}`;
};

export const createBooking = async (data: CreateBookingData): Promise<CreateBookingResult> => {
  try {
    const totalAmount = data.services.reduce((sum, service) => sum + service.price, 0);
    const travelFee = data.distanceKm ? calculateTravelFee(data.distanceKm) : 0;
    const bookingNumber = generateBookingNumber();

    const booking = {
      booking_number: bookingNumber,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      service_address: data.serviceAddress,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      total_amount: totalAmount,
      travel_fee: travelFee,
      payment_method: data.paymentMethod,
      notes: data.notes || '',
    };

    console.log('Booking created:', booking);

    return {
      success: true,
      booking,
    };
  } catch (error) {
    console.error('Unexpected error creating booking:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const isValidBookingDate = (date: string): boolean => {
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today;
};

export const isValidBookingTime = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const startTime = 8 * 60;
  const endTime = 21 * 60;

  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};

export const getBusinessHours = () => {
  return {
    weekday: { start: '08:00', end: '17:00' },
    saturday: { start: '08:00', end: '15:00' },
    sunday: { start: '08:00', end: '13:00' },
  };
};

export const isWithinBusinessHours = (date: string, time: string): boolean => {
  const bookingDate = new Date(date);
  const dayOfWeek = bookingDate.getDay();
  const [hours, minutes] = time.split(':').map(Number);
  const timeInMinutes = hours * 60 + minutes;

  const hours24 = getBusinessHours();

  let startTime: number;
  let endTime: number;

  if (dayOfWeek === 0) {
    const [startHours, startMinutes] = hours24.sunday.start.split(':').map(Number);
    const [endHours, endMinutes] = hours24.sunday.end.split(':').map(Number);
    startTime = startHours * 60 + startMinutes;
    endTime = endHours * 60 + endMinutes;
  } else if (dayOfWeek === 6) {
    const [startHours, startMinutes] = hours24.saturday.start.split(':').map(Number);
    const [endHours, endMinutes] = hours24.saturday.end.split(':').map(Number);
    startTime = startHours * 60 + startMinutes;
    endTime = endHours * 60 + endMinutes;
  } else {
    const [startHours, startMinutes] = hours24.weekday.start.split(':').map(Number);
    const [endHours, endMinutes] = hours24.weekday.end.split(':').map(Number);
    startTime = startHours * 60 + startMinutes;
    endTime = endHours * 60 + endMinutes;
  }

  return timeInMinutes >= startTime && timeInMinutes <= endTime;
};
