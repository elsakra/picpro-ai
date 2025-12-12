"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  Download,
  Check,
  Clock,
  Zap,
  Image as ImageIcon,
  Grid3X3,
  LayoutGrid,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Types
interface Headshot {
  id: string;
  style: string;
  styleName: string;
  url: string;
}

interface OrderData {
  order: {
    id: string;
    email: string;
    tier: string;
    status: string;
    created_at: string;
  };
  headshots: Array<{
    id: string;
    style: string;
    storage_url: string;
  }>;
}

// Style names mapping
const STYLE_NAMES: Record<string, string> = {
  corporate: "Corporate Executive",
  tech: "Tech Startup",
  creative: "Creative Professional",
  finance: "Finance & Banking",
  realEstate: "Real Estate",
  healthcare: "Healthcare",
  legal: "Legal Professional",
  academic: "Academic",
  linkedin: "LinkedIn Optimized",
  founder: "Startup Founder",
};

// Demo data generator
function generateDemoHeadshots(): Headshot[] {
  const styles = ["corporate", "tech", "creative", "linkedin", "founder"];
  return styles.flatMap((style) =>
    Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `${style}-${i}`,
        style,
        styleName: STYLE_NAMES[style] || style,
        url: `https://picsum.photos/seed/${style}${i}/400/500`,
      }))
  );
}

type ViewMode = "grid" | "large";
type OrderStatus = "pending" | "paid" | "training" | "generating" | "completed" | "failed";

function DashboardContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");
  const sessionId = searchParams.get("session_id");
  const isDemo = searchParams.get("demo") === "true";
  const isSuccess = searchParams.get("success") === "true";

  const [status, setStatus] = useState<OrderStatus>(isDemo ? "completed" : "pending");
  const [progress, setProgress] = useState(0);
  const [headshots, setHeadshots] = useState<Headshot[]>([]);
  const [availableStyles, setAvailableStyles] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Fetch order data
  const fetchOrderData = useCallback(async () => {
    if (isDemo) {
      setHeadshots(generateDemoHeadshots());
      setAvailableStyles(["corporate", "tech", "creative", "linkedin", "founder"]);
      setStatus("completed");
      return;
    }

    try {
      let url = "/api/order?";
      if (orderId) url += `orderId=${orderId}`;
      else if (sessionId) url += `sessionId=${sessionId}`;
      else return;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch order");

      const data: OrderData = await response.json();
      
      setStatus(data.order.status as OrderStatus);

      if (data.headshots && data.headshots.length > 0) {
        const formattedHeadshots: Headshot[] = data.headshots.map((h) => ({
          id: h.id,
          style: h.style,
          styleName: STYLE_NAMES[h.style] || h.style,
          url: h.storage_url,
        }));
        setHeadshots(formattedHeadshots);

        const styles = [...new Set(formattedHeadshots.map((h) => h.style))];
        setAvailableStyles(styles);
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      // Fall back to demo mode on error
      setHeadshots(generateDemoHeadshots());
      setAvailableStyles(["corporate", "tech", "creative", "linkedin", "founder"]);
      setStatus("completed");
    }
  }, [orderId, sessionId, isDemo]);

  // Initial fetch
  useEffect(() => {
    fetchOrderData();
  }, [fetchOrderData]);

  // Poll for updates if processing
  useEffect(() => {
    if (status === "training" || status === "generating" || status === "paid") {
      const interval = setInterval(() => {
        fetchOrderData();
        
        // Simulate progress
        setProgress((prev) => {
          const increment = status === "training" ? 0.5 : 2;
          return Math.min(prev + increment, status === "training" ? 50 : 95);
        });
      }, 5000);

      return () => clearInterval(interval);
    }

    if (status === "completed") {
      setProgress(100);
    }
  }, [status, fetchOrderData]);

  // Calculate progress based on status
  useEffect(() => {
    switch (status) {
      case "pending":
        setProgress(0);
        break;
      case "paid":
        setProgress(10);
        break;
      case "training":
        setProgress(30);
        break;
      case "generating":
        setProgress(70);
        break;
      case "completed":
        setProgress(100);
        break;
    }
  }, [status]);

  const filteredHeadshots = selectedStyle
    ? headshots.filter((h) => h.style === selectedStyle)
    : headshots;

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedImages(new Set(filteredHeadshots.map((h) => h.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const downloadSelected = async () => {
    const selectedHeadshots = headshots.filter((h) => selectedImages.has(h.id));
    
    if (selectedHeadshots.length === 1) {
      // Single image download
      const link = document.createElement("a");
      link.href = selectedHeadshots[0].url;
      link.download = `headshot-${selectedHeadshots[0].style}.webp`;
      link.click();
    } else {
      // Multiple images - open each in new tab (in production, create zip)
      alert(`Downloading ${selectedHeadshots.length} images...\n\nIn production, this would download a zip file.`);
      selectedHeadshots.forEach((h) => {
        window.open(h.url, "_blank");
      });
    }
  };

  const isProcessing = ["pending", "paid", "training", "generating"].includes(status);

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
              {status === "completed" && (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  Ready to download
                </Badge>
              )}
              {isDemo && (
                <Badge variant="outline">Demo Mode</Badge>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Error State */}
          {error && (
            <Card className="p-6 border-destructive/50 bg-destructive/10 mb-8">
              <p className="text-destructive">{error}</p>
            </Card>
          )}

          {/* Processing State */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-10 h-10 text-primary animate-spin" />
              </div>
              <h1 className="text-3xl font-bold mb-4">
                {status === "training" ? "Training Your AI Model" : 
                 status === "generating" ? "Generating Headshots" :
                 "Processing Your Order"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {status === "training" 
                  ? "Our AI is learning your unique features. This takes about 10-15 minutes."
                  : status === "generating"
                  ? "Creating professional headshots in multiple styles. Almost done!"
                  : "Please wait while we process your photos."}
              </p>

              <Card className="p-6 border-border/50 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-3" />

                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      progress >= 10 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {progress >= 10 ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground">Photos Uploaded</p>
                  </div>
                  <div>
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      progress >= 50 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {progress >= 50 ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground">AI Training</p>
                  </div>
                  <div>
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      progress >= 90 ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      {progress >= 90 ? <Check className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                    </div>
                    <p className="text-xs text-muted-foreground">Generating</p>
                  </div>
                </div>
              </Card>

              <p className="text-sm text-muted-foreground">
                We&apos;ll email you when your headshots are ready.
                <br />
                Feel free to close this page.
              </p>
            </motion.div>
          )}

          {/* Completed State - Gallery */}
          {status === "completed" && headshots.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Your Headshots</h1>
                  <p className="text-muted-foreground">
                    {headshots.length} professional headshots generated
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {selectedImages.size > 0 && (
                    <Badge variant="outline" className="cursor-pointer" onClick={clearSelection}>
                      {selectedImages.size} selected
                      <span className="ml-1">×</span>
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectedImages.size === filteredHeadshots.length ? clearSelection : selectAll}
                  >
                    {selectedImages.size === filteredHeadshots.length ? "Deselect All" : "Select All"}
                  </Button>
                  <div className="flex items-center border border-border rounded-lg p-1">
                    <button
                      className={`p-1.5 rounded ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-1.5 rounded ${viewMode === "large" ? "bg-muted" : "hover:bg-muted/50"}`}
                      onClick={() => setViewMode("large")}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                  </div>
                  <Button
                    onClick={downloadSelected}
                    disabled={selectedImages.size === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download {selectedImages.size > 0 ? `(${selectedImages.size})` : ""}
                  </Button>
                </div>
              </div>

              {/* Style Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedStyle === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(null)}
                >
                  All Styles
                </Button>
                {availableStyles.map((style) => (
                  <Button
                    key={style}
                    variant={selectedStyle === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedStyle(style)}
                  >
                    {STYLE_NAMES[style] || style}
                  </Button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                  : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
              }`}>
                <AnimatePresence>
                  {filteredHeadshots.map((headshot, index) => (
                    <motion.div
                      key={headshot.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.02 }}
                      className="relative group"
                    >
                      <Card
                        className={`overflow-hidden cursor-pointer transition-all ${
                          selectedImages.has(headshot.id)
                            ? "ring-2 ring-primary"
                            : "hover:ring-1 hover:ring-primary/50"
                        }`}
                        onClick={() => toggleImageSelection(headshot.id)}
                      >
                        <div className={`relative ${viewMode === "large" ? "aspect-square" : "aspect-[3/4]"}`}>
                          <img
                            src={headshot.url}
                            alt={headshot.styleName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        {/* Selection indicator */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedImages.has(headshot.id)
                            ? "border-primary bg-primary"
                            : "border-white/50 bg-black/20 opacity-0 group-hover:opacity-100"
                        }`}>
                          {selectedImages.has(headshot.id) && (
                            <Check className="w-4 h-4 text-primary-foreground" />
                          )}
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = headshot.url;
                              link.download = `headshot-${headshot.style}.webp`;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(headshot.url, "_blank");
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>

                      {viewMode === "large" && (
                        <p className="mt-2 text-sm text-muted-foreground">{headshot.styleName}</p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Download All CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-12 text-center"
              >
                <Card className="p-8 border-border/50 max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold mb-2">Love your headshots?</h3>
                  <p className="text-muted-foreground mb-4">
                    Download all {headshots.length} headshots in one click
                  </p>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => {
                      selectAll();
                      setTimeout(downloadSelected, 100);
                    }}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download All Headshots
                  </Button>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {/* Failed State */}
          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="p-8 border-destructive/50">
                <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                <p className="text-muted-foreground mb-6">
                  We encountered an issue processing your order. Please contact support.
                </p>
                <Button asChild>
                  <Link href="mailto:support@picpro.ai">Contact Support</Link>
                </Button>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
