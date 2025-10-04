import { supabase, type Booking, type Service } from './supabase';

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
  booking?: Booking;
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

    const bookingData = {
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
      status: 'pending',
      distance_km: data.distanceKm,
      notes: data.notes || '',
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return {
        success: false,
        error: bookingError.message,
      };
    }

    const bookingServices = data.services.map((service) => ({
      booking_id: booking.id,
      service_id: service.id,
      price_at_booking: service.price,
    }));

    const { error: servicesError } = await supabase
      .from('booking_services')
      .insert(bookingServices);

    if (servicesError) {
      console.error('Error creating booking services:', servicesError);
      await supabase.from('bookings').delete().eq('id', booking.id);
      return {
        success: false,
        error: servicesError.message,
      };
    }

    try {
      await sendBookingConfirmation({
        to: data.customerEmail,
        bookingNumber: booking.booking_number,
        customerName: data.customerName,
        services: data.services.map(s => ({
          name: s.name,
          price: s.price,
        })),
        totalAmount,
        travelFee,
        bookingDate: data.bookingDate,
        bookingTime: data.bookingTime,
        serviceAddress: data.serviceAddress,
        paymentMethod: data.paymentMethod,
      });
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

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

const sendBookingConfirmation = async (emailData: {
  to: string;
  bookingNumber: string;
  customerName: string;
  services: Array<{ name: string; price: number }>;
  totalAmount: number;
  travelFee: number;
  bookingDate: string;
  bookingTime: string;
  serviceAddress: string;
  paymentMethod: string;
}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const response = await fetch(
    `${supabaseUrl}/functions/v1/send-booking-confirmation`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(emailData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to send booking confirmation email');
  }

  return response.json();
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
