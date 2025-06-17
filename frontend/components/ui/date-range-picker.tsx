"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function DatePickerWithRange() {
  const [dateRange, setDateRange] = useState("Last 30 days")

  return (
    <Button variant="outline" className="border-white/10 text-gray-400 hover:text-white">
      <Calendar className="mr-2 h-4 w-4" />
      {dateRange}
    </Button>
  )
}
