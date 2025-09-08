'use client';

import { useState } from 'react';
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
import { Share2, Copy, Check } from 'lucide-react';

interface SharePollDialogProps {
  pollId: string;
  pollQuestion: string;
  pollDescription?: string;
  children: React.ReactNode;
}

export function SharePollDialog({ pollId, pollQuestion, pollDescription, children }: SharePollDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
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
          text: pollDescription,
          url: url,
        });
      } catch (error) {
        if ((error as DOMException).name !== 'AbortError') {
          toast.error('Error sharing poll.');
        }
      }
    } else {
      toast.error('Web Share API not supported in your browser.');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{pollQuestion}"</DialogTitle>
          <DialogDescription>
            Anyone with the link or QR code can vote on this poll.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4 py-4">
          <div className="p-4 border rounded-lg bg-white">
            <QRCodeSVG value={url} size={160} />
          </div>
          <p className="text-sm text-muted-foreground">
            Scan the QR code to open the poll
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input value={url} readOnly className="flex-1" />
          <Button type="button" size="icon" onClick={handleCopy} aria-label="Copy link">
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        {typeof navigator !== 'undefined' && navigator.share && (
          <Button type="button" onClick={handleNativeShare} className="w-full mt-2">
            <Share2 className="mr-2 h-4 w-4" />
            More sharing options...
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}