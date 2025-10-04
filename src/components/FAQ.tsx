import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqData = [
  {
    question: "What areas do you service?",
    answer: "We provide mobile massage and spa services throughout Johannesburg and Pretoria. Travel charges apply for clients more than 5km from the city center. For areas outside these regions, please contact us to discuss availability.",
  },
  {
    question: "What is the minimum booking amount?",
    answer: "For clients located more than 5km from the city center, we require a minimum booking of R500. You can combine multiple services to meet this minimum. For clients within 5km, there is no minimum booking requirement.",
  },
  {
    question: "What do I need to prepare for a mobile massage?",
    answer: "Please provide a quiet, private space (preferably a private room) where you won't be disturbed. Our therapist will bring everything else including a professional massage table, fresh linens, premium oils, and warm towels. Please ensure there's enough space to set up the massage table (approximately 2m x 1m).",
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 24-48 hours in advance to ensure availability for your preferred time slot. However, we do our best to accommodate same-day bookings when possible. Contact us to check availability.",
  },
  {
    question: "What are your operating hours?",
    answer: "Monday to Friday: 8:00 AM - 5:00 PM, Saturday: 8:00 AM - 3:00 PM, Sunday: 8:00 AM - 1:00 PM. We offer flexible appointment times including evening and weekend visits for your convenience.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept both cash and card payments on arrival. Payment is due upon completion of your service.",
  },
  {
    question: "What is your cancellation policy?",
    answer: "We kindly ask for at least 24 hours notice if you need to cancel or reschedule your appointment. This allows us to offer the time slot to another client. Last-minute cancellations (less than 24 hours) may incur a cancellation fee.",
  },
  {
    question: "Are your therapists certified?",
    answer: "Yes, all our therapists are fully certified, professionally trained, and have undergone extensive background checks. They have years of experience in both relaxation and remedial massage techniques. We maintain the highest standards of professionalism and hygiene.",
  },
  {
    question: "Can I request a specific therapist?",
    answer: "Yes, if you've had a session with one of our therapists and would like to book with them again, please mention this in the notes section when booking or contact us directly. We'll do our best to accommodate your preference subject to availability.",
  },
  {
    question: "Do you offer couple's massages?",
    answer: "Yes! We offer a Couple's Escape package that includes simultaneous massages for two people. We'll bring two massage tables and two therapists to your location for the ultimate relaxation experience together.",
  },
  {
    question: "What should I wear during the massage?",
    answer: "For massages, you can undress to your comfort level. Most clients undress completely and are covered with fresh linens throughout the session, with only the area being worked on exposed. For waxing services, please wear comfortable, loose-fitting clothing.",
  },
  {
    question: "How long does waxing last?",
    answer: "Waxing results typically last 3-6 weeks, depending on your hair growth cycle. With regular waxing, many clients find that their hair grows back finer and sparser over time.",
  },
  {
    question: "Is waxing painful?",
    answer: "While waxing can cause some discomfort, our experienced therapists use high-quality wax and professional techniques to minimize pain. First-time clients may experience more sensitivity, but most find it becomes easier with regular treatments.",
  },
  {
    question: "Can I book multiple services in one appointment?",
    answer: "Absolutely! We encourage combining services for a complete spa experience. Our package bundles offer great value for multiple services. You can also create your own custom combination by selecting individual services.",
  },
  {
    question: "Do you offer gift certificates?",
    answer: "Yes, gift certificates are available for any amount or specific service package. They make perfect gifts for birthdays, anniversaries, or special occasions. Contact us to purchase a gift certificate.",
  },
];

const FAQ = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about our mobile spa services
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="/contact"
            className="text-primary hover:underline font-semibold"
          >
            Contact us for more information
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
