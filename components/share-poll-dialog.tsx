'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Link as LinkIcon, 
  MessageSquare,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Download,
  Smartphone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface SharePollDialogProps {
  pollId: string;
  pollQuestion: string;
  pollDescription?: string;
  children: React.ReactNode;
}

export function SharePollDialog({ pollId, pollQuestion, pollDescription, children }: SharePollDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/polls/${pollId}` : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success('Poll link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: pollQuestion,
          text: pollDescription || 'Check out this poll!',
          url: url,
        });
        toast.success('Poll shared successfully!');
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          toast.error('Error sharing poll.');
        }
      }
    } else {
      toast.error('Web Share API not supported in your browser.');
    }
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.download = `poll-${pollId}-qr.png`;
      a.href = url;
      a.click();
      toast.success('QR code downloaded!');
    }
  };

  const shareToSocial = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`Check out this poll: "${pollQuestion}"`);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent(pollQuestion)}&body=${encodedText}%20${encodedUrl}`
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
    toast.success(`Opening ${platform}...`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-lg">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader>
                <motion.div variants={itemVariants}>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    Share Poll
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Share "<span className="font-medium text-foreground">{pollQuestion}</span>" with others
                  </DialogDescription>
                </motion.div>
              </DialogHeader>

              <motion.div variants={itemVariants} className="mt-6">
                <Tabs defaultValue="link" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="link" className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Link</span>
                    </TabsTrigger>
                    <TabsTrigger value="qr" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      <span className="hidden sm:inline">QR Code</span>
                    </TabsTrigger>
                    <TabsTrigger value="social" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Social</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="link" className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Input 
                              value={url} 
                              readOnly 
                              className="flex-1 bg-muted/50" 
                            />
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                type="button" 
                                size="icon" 
                                onClick={handleCopy}
                                className={isCopied ? 'bg-green-500 hover:bg-green-600' : ''}
                              >
                                <AnimatePresence mode="wait">
                                  {isCopied ? (
                                    <motion.div
                                      key="check"
                                      initial={{ scale: 0, rotate: -90 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      exit={{ scale: 0, rotate: 90 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </motion.div>
                                  ) : (
                                    <motion.div
                                      key="copy"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </Button>
                            </motion.div>
                          </div>
                          
                          {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button 
                                type="button" 
                                onClick={handleNativeShare} 
                                className="w-full"
                                variant="outline"
                              >
                                <Smartphone className="mr-2 h-4 w-4" />
                                Use device sharing
                              </Button>
                            </motion.div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="qr" className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                          <motion.div
                            id="qr-code"
                            className="p-4 border rounded-lg bg-white"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              type: "spring",
                              stiffness: 200,
                              damping: 15,
                              delay: 0.2 
                            }}
                          >
                            <QRCodeSVG 
                              value={url} 
                              size={180}
                              level="M"
                              includeMargin
                            />
                          </motion.div>
                          
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Scan with any QR code reader to open the poll
                            </p>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadQR}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                                Download QR Code
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4 mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { platform: 'twitter', icon: Twitter, label: 'Twitter', color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950' },
                            { platform: 'facebook', icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950' },
                            { platform: 'linkedin', icon: Linkedin, label: 'LinkedIn', color: 'hover:bg-blue-50 hover:text-blue-800 dark:hover:bg-blue-950' },
                            { platform: 'email', icon: Mail, label: 'Email', color: 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950' }
                          ].map(({ platform, icon: Icon, label, color }) => (
                            <motion.div
                              key={platform}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="outline"
                                className={`w-full h-12 gap-3 ${color} transition-all duration-200`}
                                onClick={() => shareToSocial(platform)}
                              >
                                <Icon className="h-5 w-5" />
                                <span className="font-medium">{label}</span>
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground text-center">
                            Share on social media to reach a wider audience
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6">
                <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-primary/10 rounded">
                        <Share2 className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Sharing Tips</p>
                        <p className="text-xs text-muted-foreground">
                          Add context when sharing to get better engagement. Let people know why their vote matters!
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}