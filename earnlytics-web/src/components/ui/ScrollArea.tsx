"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, orientation = "vertical", children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          orientation === "vertical" && "h-full w-full",
          orientation === "horizontal" && "w-full h-auto",
          orientation === "both" && "h-full w-full",
          className
        )}
        style={{
          overflowX: orientation === "vertical" ? "hidden" : "auto",
          overflowY: orientation === "horizontal" ? "hidden" : "auto",
        }}
        {...props}
      >
        <div
          className="h-full w-full"
          style={{
            overflow: orientation === "horizontal" ? "auto hidden" : 
                      orientation === "both" ? "auto auto" : "hidden auto",
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
