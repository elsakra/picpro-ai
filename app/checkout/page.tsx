"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Check,
  Shield,
  Clock,
  Zap,
  CreditCard,
  Lock,
} from "lucide-react";
import Link from "next/link";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  popular: boolean;
  features: string[];
  delivery: string;
  headshots: number;
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    priceId: "price_starter", // Replace with actual Stripe Price ID
    popular: false,
    features: [
      "40 AI headshots",
      "5 professional styles",
      "High-resolution downloads",
      "Basic backgrounds",
    ],
    delivery: "48 hours",
    headshots: 40,
  },
  {
    id: "professional",
    name: "Professional",
    price: 49,
    priceId: "price_professional", // Replace with actual Stripe Price ID
    popular: true,
    features: [
      "100 AI headshots",
      "10 professional styles",
      "4K resolution downloads",
      "Premium backgrounds",
      "LinkedIn banner included",
    ],
    delivery: "2 hours",
    headshots: 100,
  },
  {
    id: "executive",
    name: "Executive",
    price: 99,
    priceId: "price_executive", // Replace with actual Stripe Price ID
    popular: false,
    features: [
      "200+ AI headshots",
      "All styles unlocked",
      "4K + RAW formats",
      "Custom backgrounds",
      "Full branding package",
      "Priority support",
    ],
    delivery: "1 hour",
    headshots: 200,
  },
];

export default function CheckoutPage() {
  const [selectedTier, setSelectedTier] = useState<string>("professional");
  const [photoCount, setPhotoCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get uploaded photos count from localStorage
    const storedPhotos = localStorage.getItem("uploadedPhotos");
    if (storedPhotos) {
      const photos = JSON.parse(storedPhotos);
      setPhotoCount(photos.length);
    }
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: pricingTiers.find((t) => t.id === selectedTier)?.priceId,
          tierId: selectedTier,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        // For demo, go to dashboard directly
        localStorage.setItem("selectedTier", selectedTier);
        window.location.href = "/dashboard?demo=true";
      }
    } catch (error) {
      console.error("Checkout error:", error);
      // For demo, proceed anyway
      localStorage.setItem("selectedTier", selectedTier);
      window.location.href = "/dashboard?demo=true";
    }
  };

  const selectedPlan = pricingTiers.find((t) => t.id === selectedTier);

  return (
    <div className="min-h-screen bg-background bg-grid bg-radial-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PicPro AI</span>
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Step 2 of 3
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">Choose Your Package</h1>
            <p className="text-muted-foreground">
              {photoCount > 0 && (
                <span className="text-primary font-medium">
                  {photoCount} photos uploaded •{" "}
                </span>
              )}
              Select a package that fits your needs
            </p>
          </motion.div>

          {/* Pricing tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card
                  className={`relative p-6 cursor-pointer transition-all ${
                    selectedTier === tier.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50 hover:border-primary/30"
                  } ${tier.popular ? "scale-105 z-10" : ""}`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      selectedTier === tier.id
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedTier === tier.id && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-xl font-semibold">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground">one-time</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="w-4 h-4 text-primary" />
                      {tier.headshots} headshots
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      {tier.delivery}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {tier.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2 text-sm"
                      >
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 border-border/50">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {selectedPlan?.name} Package
                  </span>
                  <span>${selectedPlan?.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {selectedPlan?.headshots} AI Headshots
                  </span>
                  <span className="text-primary">Included</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {selectedPlan?.delivery} Delivery
                  </span>
                  <span className="text-primary">Included</span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${selectedPlan?.price}</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 py-6 text-lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay ${selectedPlan?.price} Now
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  Secure payment
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Money-back guarantee
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Back button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8"
          >
            <Link href="/upload">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Upload
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-muted-foreground mb-4">
              Trusted payment processing
            </p>
            <div className="flex items-center justify-center gap-8 opacity-50">
              <span className="text-2xl font-bold">VISA</span>
              <span className="text-2xl font-bold">Mastercard</span>
              <span className="text-2xl font-bold">Amex</span>
              <span className="text-xl font-bold">stripe</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}


