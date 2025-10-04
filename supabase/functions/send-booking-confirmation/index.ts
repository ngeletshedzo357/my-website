import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BookingEmailData {
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
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const data: BookingEmailData = await req.json();

    // Format services list
    const servicesList = data.services
      .map((s) => `• ${s.name} - R${(s.price / 100).toFixed(2)}`)
      .join("\n");

    const totalWithTravel = (data.totalAmount + data.travelFee) / 100;

    // Email template
    const emailBody = `
Dear ${data.customerName},

Thank you for booking with SHARMORIA! Your booking has been received and is pending confirmation.

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking Number: ${data.bookingNumber}
Date: ${data.bookingDate}
Time: ${data.bookingTime}
Location: ${data.serviceAddress}

Services:
${servicesList}

Subtotal: R${(data.totalAmount / 100).toFixed(2)}
Travel Fee: R${(data.travelFee / 100).toFixed(2)}
Total Amount: R${totalWithTravel.toFixed(2)}

Payment Method: ${data.paymentMethod === 'cash' ? 'Cash on Arrival' : 'Card on Arrival'}

What Happens Next:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. We will contact you within 24 hours to confirm your booking
2. Our therapist will arrive with all necessary equipment
3. Please ensure you have a quiet, private space ready
4. Payment is due upon completion of service

Important Reminders:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Please provide a quiet, private space for your treatment
• Our therapist will bring all equipment (table, linens, oils, warm towels)
• If you need to reschedule, please contact us at least 24 hours in advance

Contact Us:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phone: +27 83 123 4567
WhatsApp: +27 83 123 4567

Thank you for choosing SHARMORIA - Where elegance meets relaxation.

Warm regards,
The SHARMORIA Team
    `;

    // In a production environment, you would integrate with an email service like:
    // - Resend
    // - SendGrid
    // - AWS SES
    // - Postmark
    
    // For now, we'll log the email and return success
    console.log("Booking confirmation email:", {
      to: data.to,
      subject: `SHARMORIA Booking Confirmation - ${data.bookingNumber}`,
      body: emailBody,
    });

    // Simulate email sending
    // In production, replace this with actual email service:
    /*
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SHARMORIA <bookings@sharmoria.co.za>',
        to: [data.to],
        subject: `Booking Confirmation - ${data.bookingNumber}`,
        text: emailBody,
      }),
    });
    */

    return new Response(
      JSON.stringify({
        success: true,
        message: "Booking confirmation logged (email integration pending)",
        bookingNumber: data.bookingNumber,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing booking email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
