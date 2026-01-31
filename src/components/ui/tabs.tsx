'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'inline-flex w-fit items-center justify-center',
        className,
      )}
      style={{
        backgroundColor: '#F4F4F5',
        borderRadius: '6px',
        padding: '4px',
        gap: '2px',
        height: '32px'
      }}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    const element = triggerRef.current
    if (!element) return

    const observer = new MutationObserver(() => {
      const isActive = element.getAttribute('data-state') === 'active'

      if (isActive) {
        element.style.backgroundColor = '#FFFFFF'
        element.style.color = '#020817'
        element.style.fontWeight = '500'
        element.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
      } else {
        element.style.backgroundColor = 'transparent'
        element.style.color = '#71717A'
        element.style.fontWeight = '500'
        element.style.boxShadow = 'none'
      }
    })

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['data-state']
    })

    // Set initial state
    const isActive = element.getAttribute('data-state') === 'active'
    if (isActive) {
      element.style.backgroundColor = '#FFFFFF'
      element.style.color = '#020817'
      element.style.fontWeight = '500'
      element.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
    }

    return () => observer.disconnect()
  }, [])

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderRadius: '4px',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '4px',
    paddingBottom: '4px',
    fontSize: '12px',
    fontWeight: 500,
    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#71717A',
    outline: 'none'
  }

  return (
    <TabsPrimitive.Trigger
      ref={triggerRef}
      data-slot="tabs-trigger"
      className={cn(
        "whitespace-nowrap transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={baseStyle}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('flex-1 outline-none', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
