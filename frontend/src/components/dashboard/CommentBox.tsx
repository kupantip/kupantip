"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Image, Type, Film } from "lucide-react"
import { cn } from "@/lib/utils"  // shadcn utility

interface CommentBoxProps {
  className?: string
}

export default function CommentBox({ className }: CommentBoxProps) {
  const [comment, setComment] = useState("")
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={cn(
        "w-full rounded-3xl border px-4 py-2 shadow-sm",
        className
      )}
    >
      <Textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        onFocus={() => setShowActions(true)}
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        rows={1}
      />

      <div className="mt-3 flex items-center justify-between">
        {/* Left action icons */}
        <div className="flex gap-3 text-gray-500">
          <Image size={16} className="cursor-pointer" />
          <Film size={16} className="cursor-pointer" />
          <Type size={16} className="cursor-pointer" />
        </div>

        {/* Right buttons */}
        {showActions && (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setComment("")
                setShowActions(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Comment submitted:", comment)
                setComment("")
                setShowActions(false)
              }}
              disabled={!comment.trim()}
            >
              Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
