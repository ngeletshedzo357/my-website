import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CircleAlert as AlertCircle, CircleCheck as CheckCircle2, X, Loader as Loader2 } from "lucide-react";
import { fetchActiveServices, getServiceByName, groupServicesByCategory } from "@/lib/services";
import { createBooking, MINIMUM_BOOKING_AMOUNT, calculateTravelFee, FREE_TRAVEL_RADIUS_KM, isValidBookingDate, isWithinBusinessHours, getBusinessHours } from "@/lib/bookings";
import type { Service } from "@/lib/supabase";

const Booking = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceName = searchParams.get("service") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    distance: "",
    paymentMethod: "cash",
    notes: "",
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (preselectedServiceName && services.length > 0) {
      const service = services.find(s => s.name === preselectedServiceName);
      if (service && !selectedServices.find(s => s.id === service.id)) {
        setSelectedServices([service]);
      }
    }
  }, [preselectedServiceName, services]);

  const loadServices = async () => {
    try {
      const data = await fetchActiveServices();
      setServices(data);
    } catch (error) {
      toast.error("Failed to load services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const distanceKm = parseFloat(formData.distance) || 0;
  const travelFee = distanceKm > 0 ? calculateTravelFee(distanceKm) : 0;
  const meetsMinimum = totalAmount >= MINIMUM_BOOKING_AMOUNT;
  const amountNeeded = MINIMUM_BOOKING_AMOUNT - totalAmount;

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.find(s => s.id === service.id);

    if (isSelected) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const removeService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedServices.length === 0) {
      toast.error("Please select at least one service");
      return;
    }

    if (!meetsMinimum) {
      toast.error(`Minimum booking amount is R${(MINIMUM_BOOKING_AMOUNT / 100).toFixed(2)}. Please add more services.`);
      return;
    }

    if (!isValidBookingDate(formData.date)) {
      toast.error("Please select a future date");
      return;
    }

    if (!isWithinBusinessHours(formData.date, formData.time)) {
      const hours = getBusinessHours();
      const bookingDate = new Date(formData.date);
      const dayOfWeek = bookingDate.getDay();

      let hoursText = '';
      if (dayOfWeek === 0) {
        hoursText = `${hours.sunday.start} - ${hours.sunday.end}`;
      } else if (dayOfWeek === 6) {
        hoursText = `${hours.saturday.start} - ${hours.saturday.end}`;
      } else {
        hoursText = `${hours.weekday.start} - ${hours.weekday.end}`;
      }

      toast.error(`Please select a time within our business hours: ${hoursText}`);
      return;
    }

    setSubmitting(true);

    try {
      const result = await createBooking({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceAddress: formData.address,
        bookingDate: formData.date,
        bookingTime: formData.time,
        services: selectedServices,
        paymentMethod: formData.paymentMethod,
        distanceKm: distanceKm || undefined,
        notes: formData.notes,
      });

      if (result.success && result.booking) {
        toast.success(
          `Booking confirmed! Your booking number is ${result.booking.booking_number}. We will contact you within 24 hours.`
        );

        setSelectedServices([]);
        setFormData({
          date: "",
          time: "",
          name: "",
          email: "",
          phone: "",
          address: "",
          distance: "",
          paymentMethod: "cash",
          notes: "",
        });
      } else {
        toast.error(result.error || "Failed to create booking");
      }
    } catch (error) {
      toast.error("Failed to create booking. Please try again.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const groupedServices = groupServicesByCategory(services);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Book Appointment - SHARMORIA Mobile Spa"
        description="Book your mobile massage, waxing, or facial appointment online. Choose from our wide range of services and packages. Flexible scheduling, professional therapists, we come to you."
        keywords="book massage online, mobile spa booking, massage appointment Johannesburg, waxing booking Pretoria, spa services booking, home massage reservation"
      />
      <Header />

      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-5xl font-bold font-playfair text-foreground">
              Book an Appointment
            </h1>
            <p className="text-muted-foreground">
              Select your services and preferred appointment time
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-medium p-6">
                <h2 className="text-2xl font-bold font-playfair mb-4">
                  Select Services
                </h2>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">
                        Minimum Booking: R{(MINIMUM_BOOKING_AMOUNT / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        For clients located more than {FREE_TRAVEL_RADIUS_KM}km from the city center of Pretoria or Johannesburg,
                        we require a minimum booking of R{(MINIMUM_BOOKING_AMOUNT / 100).toFixed(2)}. Feel free to combine multiple services to meet this amount.
                      </p>
                    </div>
                  </div>
                </div>

                {groupedServices.package && groupedServices.package.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Package Bundles</h3>
                    <div className="space-y-2">
                      {groupedServices.package.map((service) => (
                        <ServiceCheckbox
                          key={service.id}
                          service={service}
                          isSelected={!!selectedServices.find(s => s.id === service.id)}
                          onToggle={toggleService}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedServices.massage && groupedServices.massage.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Massage Services</h3>
                    <div className="space-y-2">
                      {groupedServices.massage.map((service) => (
                        <ServiceCheckbox
                          key={service.id}
                          service={service}
                          isSelected={!!selectedServices.find(s => s.id === service.id)}
                          onToggle={toggleService}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedServices.waxing && groupedServices.waxing.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Waxing Packages</h3>
                    <div className="space-y-2">
                      {groupedServices.waxing.map((service) => (
                        <ServiceCheckbox
                          key={service.id}
                          service={service}
                          isSelected={!!selectedServices.find(s => s.id === service.id)}
                          onToggle={toggleService}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {groupedServices['waxing-single'] && groupedServices['waxing-single'].length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Individual Waxing Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {groupedServices['waxing-single'].map((service) => (
                        <ServiceCheckbox
                          key={service.id}
                          service={service}
                          isSelected={!!selectedServices.find(s => s.id === service.id)}
                          onToggle={toggleService}
                          compact
                        />
                      ))}
                    </div>
                  </div>
                )}

                {(groupedServices.facial || groupedServices.addon) && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-foreground">Facial & Add-ons</h3>
                    <div className="space-y-2">
                      {[...(groupedServices.facial || []), ...(groupedServices.addon || [])].map((service) => (
                        <ServiceCheckbox
                          key={service.id}
                          service={service}
                          isSelected={!!selectedServices.find(s => s.id === service.id)}
                          onToggle={toggleService}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-medium p-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
                <h2 className="text-xl font-bold font-playfair mb-4">
                  Booking Summary
                </h2>

                {selectedServices.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No services selected yet
                  </p>
                ) : (
                  <div className="space-y-3 mb-4">
                    {selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-start gap-2 p-3 bg-muted rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.duration}
                          </p>
                        </div>
                        <p className="font-bold text-primary text-sm whitespace-nowrap">
                          R{(service.price / 100).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeService(service.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <p>Subtotal:</p>
                    <p className="font-semibold">R{(totalAmount / 100).toFixed(2)}</p>
                  </div>

                  {travelFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <p>Travel Fee ({distanceKm}km):</p>
                      <p className="font-semibold">R{(travelFee / 100).toFixed(2)}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <p className="font-semibold">Total:</p>
                    <p className="text-2xl font-bold text-primary">
                      R{((totalAmount + travelFee) / 100).toFixed(2)}
                    </p>
                  </div>

                  {!meetsMinimum && selectedServices.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-semibold text-amber-900">
                            Add R{(amountNeeded / 100).toFixed(2)} more
                          </p>
                          <p className="text-amber-700">
                            to meet the R{(MINIMUM_BOOKING_AMOUNT / 100).toFixed(2)} minimum
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {meetsMinimum && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-900">
                          Minimum booking met!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedServices.length > 0 && (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-lg shadow-medium p-6 space-y-4"
                >
                  <h3 className="font-semibold text-lg mb-4">Your Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      type="time"
                      id="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri: 8AM-5PM | Sat: 8AM-3PM | Sun: 8AM-1PM
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      type="text"
                      id="name"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      type="tel"
                      id="phone"
                      placeholder="+27 83 123 4567"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Service Address *</Label>
                    <Input
                      type="text"
                      id="address"
                      placeholder="Street, Suburb, City"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance from City Center (km)</Label>
                    <Input
                      type="number"
                      id="distance"
                      placeholder="e.g. 8"
                      min="0"
                      step="0.1"
                      value={formData.distance}
                      onChange={(e) => handleChange("distance", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      First {FREE_TRAVEL_RADIUS_KM}km free. R{(calculateTravelFee(FREE_TRAVEL_RADIUS_KM + 1) / 100).toFixed(2)} per km after.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or requirements..."
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method *</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleChange("paymentMethod", value)}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="cursor-pointer flex-1">
                          Cash on Arrival
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted transition-colors cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="cursor-pointer flex-1">
                          Card on Arrival
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-hero text-white hover:opacity-90 transition-opacity"
                    disabled={!meetsMinimum || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : meetsMinimum ? (
                      "Confirm Booking"
                    ) : (
                      `Add R${(amountNeeded / 100).toFixed(2)} More to Book`
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    We'll confirm your booking within 24 hours
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface ServiceCheckboxProps {
  service: Service;
  isSelected: boolean;
  onToggle: (service: Service) => void;
  compact?: boolean;
}

const ServiceCheckbox = ({ service, isSelected, onToggle, compact }: ServiceCheckboxProps) => {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors cursor-pointer"
      onClick={() => onToggle(service)}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(service)}
      />
      <div className="flex-1 min-w-0">
        <p className={`font-medium ${compact ? 'text-sm truncate' : ''}`}>{service.name}</p>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            {service.duration}
          </p>
        )}
      </div>
      <p className={`font-bold text-primary ${compact ? 'text-sm' : ''}`}>
        R{(service.price / 100).toFixed(2)}
      </p>
    </div>
  );
};

export default Booking;
