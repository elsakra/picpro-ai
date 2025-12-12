"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  X,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ImagePlus,
  Camera,
  Sun,
  Smile,
  RotateCcw,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import heic2any from "heic2any";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  status: "uploading" | "success" | "error" | "converting";
}

const MIN_PHOTOS = 10;
const MAX_PHOTOS = 20;
const RECOMMENDED_PHOTOS = 15;

const photoTips = [
  { icon: Camera, text: "Clear, well-lit photos" },
  { icon: Sun, text: "Natural lighting works best" },
  { icon: Smile, text: "Various expressions" },
  { icon: RotateCcw, text: "Different angles" },
];

// Check if file is HEIC/HEIF format
function isHeicFile(file: File): boolean {
  const heicTypes = ["image/heic", "image/heif"];
  const heicExtensions = [".heic", ".heif"];
  
  // Check MIME type
  if (heicTypes.includes(file.type.toLowerCase())) {
    return true;
  }
  
  // Check file extension (some browsers don't set correct MIME type for HEIC)
  const fileName = file.name.toLowerCase();
  return heicExtensions.some(ext => fileName.endsWith(ext));
}

// Convert HEIC to JPEG
async function convertHeicToJpeg(file: File): Promise<File> {
  try {
    console.log(`Converting HEIC file: ${file.name}`);
    const blob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });
    
    // heic2any can return a Blob or Blob[], handle both cases
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;
    
    const newFileName = file.name.replace(/\.heic$/i, ".jpg").replace(/\.heif$/i, ".jpg");
    const convertedFile = new File([resultBlob], newFileName, { 
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    
    console.log(`Successfully converted ${file.name} to ${newFileName}`);
    return convertedFile;
  } catch (error) {
    console.error("HEIC conversion error:", error);
    throw new Error(`Failed to convert ${file.name}. Please try a different image.`);
  }
}

export default function UploadPage() {
  const router = useRouter();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string>("");

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/") || isHeicFile(file)
      );
      handleFiles(files);
    },
    []
  );

  const handleFiles = async (files: File[]) => {
    const remainingSlots = MAX_PHOTOS - images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    // Check if any files need HEIC conversion
    const heicFiles = filesToAdd.filter(isHeicFile);
    const regularFiles = filesToAdd.filter(f => !isHeicFile(f));
    
    // Add regular files immediately
    const regularImages: UploadedImage[] = regularFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      status: "success" as const,
    }));
    
    if (regularImages.length > 0) {
      setImages((prev) => [...prev, ...regularImages]);
    }
    
    // Convert HEIC files
    if (heicFiles.length > 0) {
      setIsConverting(true);
      setConversionStatus(`Converting ${heicFiles.length} iPhone photo${heicFiles.length > 1 ? 's' : ''}...`);
      
      for (let i = 0; i < heicFiles.length; i++) {
        const file = heicFiles[i];
        setConversionStatus(`Converting photo ${i + 1} of ${heicFiles.length}...`);
        
        try {
          const convertedFile = await convertHeicToJpeg(file);
          const newImage: UploadedImage = {
            id: Math.random().toString(36).substring(7),
            file: convertedFile,
            preview: URL.createObjectURL(convertedFile),
            status: "success",
          };
          setImages((prev) => [...prev, newImage]);
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          // Still show the error in the list
          const errorImage: UploadedImage = {
            id: Math.random().toString(36).substring(7),
            file,
            preview: "",
            status: "error",
          };
          setImages((prev) => [...prev, errorImage]);
        }
      }
      
      setIsConverting(false);
      setConversionStatus("");
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleContinue = async () => {
    if (images.length < MIN_PHOTOS) return;

    setIsProcessing(true);
    // Store images in localStorage for the checkout page
    // In production, we'd upload to cloud storage here
    const imageData = images.map((img) => ({
      id: img.id,
      name: img.file.name,
      size: img.file.size,
      preview: img.preview,
    }));
    localStorage.setItem("uploadedPhotos", JSON.stringify(imageData));
    
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    router.push("/checkout");
  };

  const progress = (images.length / RECOMMENDED_PHOTOS) * 100;
  const canContinue = images.length >= MIN_PHOTOS;

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
                Step 1 of 3
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4">Upload Your Photos</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload {MIN_PHOTOS}-{MAX_PHOTOS} clear photos of yourself. The more
              variety (angles, expressions, lighting), the better your AI
              headshots will be!
            </p>
          </motion.div>

          {/* Progress indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {images.length} of {RECOMMENDED_PHOTOS} photos (minimum {MIN_PHOTOS})
              </span>
              {isConverting ? (
                <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  {conversionStatus}
                </Badge>
              ) : canContinue ? (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Check className="w-3 h-3 mr-1" />
                  Ready to continue
                </Badge>
              ) : null}
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2" />
          </motion.div>

          {/* Photo tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {photoTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <tip.icon className="w-4 h-4" />
                </div>
                {tip.text}
              </div>
            ))}
          </motion.div>

          {/* Upload area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card
              className={`relative border-2 border-dashed transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={images.length >= MAX_PHOTOS || isConverting}
              />

              {images.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Drag & drop your photos here
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    or click to browse from your device
                  </p>
                  <Button variant="outline">
                    <ImagePlus className="w-4 h-4 mr-2" />
                    Select Photos
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  {/* Image grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-6">
                    <AnimatePresence>
                      {images.map((image, index) => (
                        <motion.div
                          key={image.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative aspect-square group"
                        >
                          <img
                            src={image.preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(image.id);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          {image.status === "success" && (
                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Add more button */}
                    {images.length < MAX_PHOTOS && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <ImagePlus className="w-6 h-6 text-muted-foreground" />
                      </motion.div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {images.length} photo{images.length !== 1 ? "s" : ""} selected
                    </span>
                    {images.length < MIN_PHOTOS && (
                      <span className="text-amber-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        Add {MIN_PHOTOS - images.length} more photo
                        {MIN_PHOTOS - images.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mt-8"
          >
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>

            <Button
              onClick={handleContinue}
              disabled={!canContinue || isProcessing || isConverting}
              className="bg-primary hover:bg-primary/90"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  Continue to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Help text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Your photos are processed securely and deleted after generation.
            <br />
            We never share your images with third parties.
          </motion.p>
        </div>
      </main>
    </div>
  );
}


