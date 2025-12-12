"use client";

import { useState, useEffect } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  Upload,
  Wand2,
  Download,
  Check,
  Star,
  ArrowRight,
  Shield,
  Clock,
  Zap,
  ChevronDown,
  Camera,
  Briefcase,
  Linkedin,
  Users,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Before/After placeholder images (gradient placeholders)
const BeforeAfterShowcase = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const transformations = [
    { before: "Casual selfie", after: "Tech Executive", color: "from-blue-500/20 to-purple-500/20" },
    { before: "Phone photo", after: "Creative Director", color: "from-amber-500/20 to-rose-500/20" },
    { before: "Quick snap", after: "Finance Professional", color: "from-emerald-500/20 to-cyan-500/20" },
    { before: "Home photo", after: "Startup Founder", color: "from-violet-500/20 to-pink-500/20" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {transformations.map((item, index) => (
        <motion.div
          key={index}
          className="relative group cursor-pointer"
          onHoverStart={() => setHoveredIndex(index)}
          onHoverEnd={() => setHoveredIndex(null)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className={`aspect-[3/4] rounded-2xl bg-gradient-to-br ${item.color} border border-border/50 overflow-hidden relative`}>
            {/* Before state */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-muted/50"
              animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center p-4">
                <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{item.before}</p>
              </div>
            </motion.div>
            {/* After state */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center p-4">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium text-primary">{item.after}</p>
              </div>
            </motion.div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
            <Badge variant="secondary" className="text-xs">
              {hoveredIndex === index ? "After" : "Before"}
            </Badge>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Pricing Card Component
const PricingCard = ({
  title,
  price,
  features,
  popular,
  ctaText,
}: {
  title: string;
  price: number;
  features: string[];
  popular?: boolean;
  ctaText: string;
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`relative ${popular ? "scale-105 z-10" : ""}`}
  >
    {popular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2">
        <Badge className="bg-primary text-primary-foreground px-4 py-1">
          Most Popular
        </Badge>
      </div>
    )}
    <Card
      className={`p-6 h-full ${
        popular
          ? "border-primary/50 bg-gradient-to-b from-primary/10 to-transparent"
          : "border-border/50"
      }`}
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">${price}</span>
          <span className="text-muted-foreground">one-time</span>
        </div>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2">
            <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/upload">
        <Button
          className={`w-full ${
            popular
              ? "bg-primary hover:bg-primary/90"
              : "bg-secondary hover:bg-secondary/90"
          }`}
        >
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </Card>
  </motion.div>
);

// FAQ Item
const FAQItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-border/50">
      <button
        className="w-full py-4 flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-muted-foreground transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
      >
        <p className="pb-4 text-muted-foreground">{answer}</p>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
    <div className="min-h-screen bg-background bg-grid bg-radial-gradient" suppressHydrationWarning>
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PicPro AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </div>
            <Link href="/upload">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            <motion.div variants={fadeInUp}>
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Trusted by 10,000+ professionals
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Professional Headshots
              <br />
              <span className="gradient-text">in Minutes, Not Hours</span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            >
              Upload a few selfies, and our AI creates 100+ stunning professional
              headshots. Perfect for LinkedIn, resumes, and your personal brand.
              No photographer needed.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/upload">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 animate-pulse-glow"
                >
                  Get Your Headshots Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                100% money-back guarantee
              </p>
            </motion.div>
          </motion.div>

          {/* Before/After Showcase */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-center text-sm text-muted-foreground mb-6">
              Hover to see the transformation
            </p>
            <BeforeAfterShowcase />
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="mt-16 flex flex-wrap items-center justify-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Results in 30 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="text-sm">50,000+ headshots created</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
              <span className="text-sm text-muted-foreground ml-2">4.9/5 rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-12 border-y border-border/50 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            <Linkedin className="w-8 h-8" />
            <span className="text-2xl font-bold">Indeed</span>
            <span className="text-2xl font-bold">Glassdoor</span>
            <span className="text-2xl font-bold">AngelList</span>
            <span className="text-2xl font-bold">Y Combinator</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              Simple Process
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to get your professional headshots. No studio visit
              required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "1. Upload Selfies",
                description:
                  "Upload 10-15 photos of yourself. Different angles and lighting work best.",
              },
              {
                icon: Wand2,
                title: "2. AI Magic",
                description:
                  "Our AI learns your unique features and generates professional headshots in various styles.",
              },
              {
                icon: Download,
                title: "3. Download & Use",
                description:
                  "Get 100+ high-resolution headshots ready for LinkedIn, resumes, and more.",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-border/50 hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Style Showcase */}
      <section className="py-24 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              Multiple Styles
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              One Upload, Endless Possibilities
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get headshots in various professional styles - all from a single upload.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Corporate Executive",
              "Tech Startup",
              "Creative Professional",
              "Finance & Banking",
              "Real Estate",
              "Healthcare",
              "Legal Professional",
              "Academic",
            ].map((style, index) => (
              <motion.div
                key={style}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="p-4 text-center border-border/50 hover:border-primary/50 transition-all cursor-pointer">
                  <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-3 flex items-center justify-center">
                    <Briefcase className="w-8 h-8 text-primary/60" />
                  </div>
                  <p className="text-sm font-medium">{style}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              Save Time & Money
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Why PicPro AI?
            </h2>
          </div>

          <Card className="p-8 border-border/50">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-muted-foreground line-through">
                  Traditional Photographer
                </h3>
                <ul className="space-y-3">
                  {[
                    "$200-500+ per session",
                    "Schedule weeks in advance",
                    "Travel to studio",
                    "Limited outfit changes",
                    "5-10 photos only",
                    "Days for delivery",
                  ].map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center text-xs">
                        ✕
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 gradient-text">
                  PicPro AI
                </h3>
                <ul className="space-y-3">
                  {[
                    "Just $29-99 one-time",
                    "Start instantly",
                    "From your couch",
                    "Unlimited style variations",
                    "100+ professional headshots",
                    "Ready in 30 minutes",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              Simple Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Choose Your Package
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              One-time payment. No subscriptions. Keep your headshots forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              title="Starter"
              price={29}
              features={[
                "40 AI headshots",
                "5 professional styles",
                "48-hour delivery",
                "High-resolution downloads",
                "Basic backgrounds",
              ]}
              ctaText="Get Started"
            />
            <PricingCard
              title="Professional"
              price={49}
              popular
              features={[
                "100 AI headshots",
                "10 professional styles",
                "2-hour express delivery",
                "4K resolution downloads",
                "Premium backgrounds",
                "LinkedIn banner included",
              ]}
              ctaText="Most Popular"
            />
            <PricingCard
              title="Executive"
              price={99}
              features={[
                "200+ AI headshots",
                "All styles unlocked",
                "1-hour priority delivery",
                "4K + RAW formats",
                "Custom backgrounds",
                "Full branding package",
                "Priority support",
              ]}
              ctaText="Go Premium"
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              100% money-back guarantee if you&apos;re not satisfied
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              Success Stories
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Loved by Professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "I was skeptical at first, but the results blew me away. Got my dream job with these headshots on my LinkedIn!",
                author: "Sarah M.",
                role: "Product Manager at Google",
              },
              {
                quote:
                  "Saved me $400 and a whole day. The AI perfectly captured my professional look. Highly recommend!",
                author: "James K.",
                role: "Startup Founder",
              },
              {
                quote:
                  "As a real estate agent, I need fresh photos constantly. PicPro AI is now my go-to solution.",
                author: "Maria L.",
                role: "Top 1% Realtor",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full border-border/50">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-primary text-primary"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 bg-muted/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              FAQ
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Common Questions
            </h2>
          </div>

          <Card className="p-6 border-border/50">
            <FAQItem
              question="How does it work?"
              answer="Simply upload 10-15 photos of yourself (selfies work great!). Our AI analyzes your unique features and generates professional headshots in various styles. The whole process takes about 30 minutes."
            />
            <FAQItem
              question="What kind of photos should I upload?"
              answer="Upload clear photos of your face from different angles. Good lighting helps! Selfies, casual photos, and even older photos work well. The more variety, the better the results."
            />
            <FAQItem
              question="How long does it take?"
              answer="Depending on your package: Starter (48 hours), Professional (2 hours), Executive (1 hour). Most users get their headshots much faster!"
            />
            <FAQItem
              question="Can I get a refund if I'm not satisfied?"
              answer="Absolutely! We offer a 100% money-back guarantee. If you're not happy with your headshots, contact us within 7 days for a full refund."
            />
            <FAQItem
              question="Are the headshots really AI-generated?"
              answer="Yes! We use state-of-the-art AI trained on millions of professional photos. The AI learns your unique features and generates completely new, professional-looking headshots."
            />
            <FAQItem
              question="Can I use these for LinkedIn and other platforms?"
              answer="Absolutely! Your headshots are yours to use anywhere - LinkedIn, resumes, company websites, social media, business cards, and more."
            />
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your
              <br />
              <span className="gradient-text">Professional Image?</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 10,000+ professionals who&apos;ve upgraded their online presence
              with PicPro AI headshots.
            </p>
            <Link href="/upload">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-12 py-6 animate-pulse-glow"
              >
                Get Your Headshots Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Starting at $29 • 100% money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PicPro AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 PicPro AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
    </LazyMotion>
  );
}
