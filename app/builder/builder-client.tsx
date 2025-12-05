'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the builder to avoid SSR issues
const EmailBuilder = dynamic(() => import('@/components/EmailBuilder'), {
  ssr: false,
})

export default function BuilderClient() {
  return <EmailBuilder />
}

