'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"
import { QRCodeSVG } from "qrcode.react"

interface SharePollDialogProps {
  children: React.ReactNode
  pollId: string
  pollTitle: string
  pollDescription: string
}

export function SharePollDialog({
  children,
  pollId,
  pollTitle,
}: SharePollDialogProps) {
  const shareLink = `${window.location.origin}/polls/${pollId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    toast.success("Link copied to clipboard!")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pollTitle}</DialogTitle>
          <DialogDescription>
            Share this poll with others to start collecting votes.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 border rounded-lg">
            <QRCodeSVG value={shareLink} size={128} />
          </div>
          <p className="text-sm text-muted-foreground">
            Or copy the link below
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Input value={shareLink} readOnly />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
