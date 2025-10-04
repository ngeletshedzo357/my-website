import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { LogOut, Calendar, MessageSquare, Star, Gift, Users, TrendingUp, Loader as Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { Booking, Contact, Testimonial } from '@/lib/supabase';
import logo from '@/assets/logo.png';

const AdminDashboard = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    newContacts: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBookings(),
        loadContacts(),
        loadTestimonials(),
      ]);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      setBookings(data);
      const totalRevenue = data
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.total_amount + b.travel_fee, 0);

      setStats(prev => ({
        ...prev,
        totalBookings: data.length,
        pendingBookings: data.filter(b => b.status === 'pending').length,
        totalRevenue,
      }));
    }
  };

  const loadContacts = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      setContacts(data);
      setStats(prev => ({
        ...prev,
        newContacts: data.filter(c => c.status === 'new').length,
      }));
    }
  };

  const loadTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data) {
      setTestimonials(data);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId);

    if (error) {
      toast.error('Failed to update booking status');
      console.error(error);
    } else {
      toast.success('Booking status updated');
      loadBookings();
    }
  };

  const updateContactStatus = async (contactId: string, status: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ status })
      .eq('id', contactId);

    if (error) {
      toast.error('Failed to update contact status');
      console.error(error);
    } else {
      toast.success('Contact status updated');
      loadContacts();
    }
  };

  const approveTestimonial = async (testimonialId: string, approved: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_approved: approved })
      .eq('id', testimonialId);

    if (error) {
      toast.error('Failed to update testimonial');
      console.error(error);
    } else {
      toast.success(approved ? 'Testimonial approved' : 'Testimonial unapproved');
      loadTestimonials();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      confirmed: "default",
      completed: "secondary",
      cancelled: "destructive",
      new: "default",
      read: "secondary",
      responded: "outline",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="SHARMORIA" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold font-playfair">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingBookings} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{(stats.totalRevenue / 100).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                From completed bookings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newContacts}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testimonials.length}</div>
              <p className="text-xs text-muted-foreground">
                {testimonials.filter(t => !t.is_approved).length} pending approval
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bookings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="contacts">Messages</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  Manage customer appointments and reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{booking.booking_number}</p>
                          {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.customer_name} - {booking.customer_email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {booking.customer_phone}
                        </p>
                        <p className="text-sm">
                          {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                        </p>
                        <p className="text-sm font-medium">
                          Total: R{((booking.total_amount + booking.travel_fee) / 100).toFixed(2)}
                          {booking.travel_fee > 0 && (
                            <span className="text-muted-foreground text-xs ml-2">
                              (includes R{(booking.travel_fee / 100).toFixed(2)} travel fee)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Address: {booking.service_address}
                        </p>
                        {booking.notes && (
                          <p className="text-sm text-muted-foreground italic">
                            Notes: {booking.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No bookings yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>
                  Customer inquiries and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{contact.name}</p>
                          {getStatusBadge(contact.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {contact.email} {contact.phone && `• ${contact.phone}`}
                        </p>
                        <p className="text-sm mt-2">{contact.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(contact.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contact.status === 'new' && (
                          <Button
                            size="sm"
                            onClick={() => updateContactStatus(contact.id, 'read')}
                          >
                            Mark Read
                          </Button>
                        )}
                        {contact.status === 'read' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateContactStatus(contact.id, 'responded')}
                          >
                            Mark Responded
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No messages yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Testimonials</CardTitle>
                <CardDescription>
                  Manage customer reviews and ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{testimonial.customer_name}</p>
                          <div className="flex gap-1">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <span key={i} className="text-amber-400">★</span>
                            ))}
                          </div>
                          {testimonial.is_approved ? (
                            <Badge variant="secondary">Approved</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                        <p className="text-sm mt-2">{testimonial.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(testimonial.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!testimonial.is_approved ? (
                          <Button
                            size="sm"
                            onClick={() => approveTestimonial(testimonial.id, true)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTestimonial(testimonial.id, false)}
                          >
                            Unapprove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {testimonials.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No testimonials yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
