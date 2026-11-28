"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import { HoverLift } from "@/components/motion/hover-lift"
import { Pressable } from "@/components/motion/pressable"
import { Reveal } from "@/components/motion/reveal"
import { Stagger, StaggerItem } from "@/components/motion/stagger"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-title font-semibold text-text">{title}</h2>
        {hint ? <p className="text-label text-text-3">{hint}</p> : null}
        <Separator />
      </div>
      {children}
    </section>
  )
}

const SWATCHES = [
  ["bg", "bg-bg"],
  ["surface", "bg-surface"],
  ["surface-2", "bg-surface-2"],
  ["surface-3", "bg-surface-3"],
  ["accent-brand", "bg-accent-brand"],
  ["accent-brand-2", "bg-accent-brand-2"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["focus", "bg-focus"],
] as const

export function Showcase() {
  return (
    <main className="mx-auto flex w-full max-w-content flex-col gap-12 px-6 py-12">
      <header className="flex flex-col gap-3">
        <p className="text-mono uppercase tracking-[0.14em] text-text-3">
          Internal · not linked · noindex
        </p>
        <h1 className="text-display-2 font-semibold text-text">
          Kraked design system
        </h1>
        <p className="max-w-wide text-body text-text-2">
          Token layer and primitives for the redesign. Every component below
          reads from the semantic tokens, so switching to the light theme is a
          single class change on the root element.
        </p>
      </header>

      <Section title="Colour tokens" hint="bg / surface / line / accent / status">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SWATCHES.map(([name, className]) => (
            <div
              key={name}
              className="flex flex-col gap-2 rounded-card border border-line p-2"
            >
              <div className={`h-14 w-full rounded-[8px] border border-line ${className}`} />
              <span className="text-mono text-text-2">{name}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type scale" hint="display-1 / display-2 / title / body / label / mono">
        <div className="flex flex-col gap-3">
          <p className="text-display-1 font-semibold text-text">Display 1</p>
          <p className="text-display-2 font-semibold text-text">Display 2</p>
          <p className="text-title font-semibold text-text">Title</p>
          <p className="max-w-wide text-body text-text-2">
            Body — study together, stay focused. This is the size used for
            paragraphs and form help text.
          </p>
          <p className="text-label text-text-2">Label</p>
          <p className="text-mono text-text-3">mono · 00:42:13</p>
        </div>
      </Section>

      <Section title="Buttons" hint="primary / secondary / ghost / danger · sm / md / lg">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">
            <Plus /> Large with icon
          </Button>
        </div>
      </Section>

      <Section title="Fields" hint="default · invalid · textarea">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="design-name">Room name</Label>
            <Input id="design-name" placeholder="Friday focus" />
            <p className="text-label text-text-3">
              Shown under the field for guidance.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="design-invalid">Room code</Label>
            <Input
              id="design-invalid"
              aria-invalid="true"
              defaultValue="ABCDE"
            />
            <FieldError>Room codes are 6 to 10 characters.</FieldError>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="design-notes">Notes</Label>
            <Textarea id="design-notes" placeholder="What are you working on?" />
          </div>
        </div>
      </Section>

      <Section title="Badges" hint="neutral / accent / success / warning / danger">
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">On track</Badge>
          <Badge variant="warning">Paused</Badge>
          <Badge variant="danger">Overdue</Badge>
        </div>
      </Section>

      <Section title="Card" hint="surface · line · radius-card · shadow-card">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly focus</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body text-text-2">
                12 sessions · 6 h 40 m tracked. Cards inherit the palette, so
                the same markup works in light and dark.
              </p>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Open stats</Button>
              <Button size="sm" variant="ghost">
                Dismiss
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading state</CardTitle>
              <CardDescription>Skeleton rows</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Tabs" hint="Radix · roving focus · arrow keys">
        <Tabs defaultValue="week">
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
          <TabsContent value="week">
            <p className="text-body text-text-2">Week content.</p>
          </TabsContent>
          <TabsContent value="month">
            <p className="text-body text-text-2">Month content.</p>
          </TabsContent>
          <TabsContent value="all">
            <p className="text-body text-text-2">All-time content.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Dialog" hint="Radix · focus trap · escape to close">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="secondary">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Leave room?</DialogTitle>
              <DialogDescription>
                You will stop receiving live updates for this room. Your tracked
                time is kept.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="danger">Leave</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Section>

      <Section
        title="Motion"
        hint="spring.press / spring.ui / spring.reveal · honours prefers-reduced-motion"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Pressable className="h-10 rounded-card bg-accent-brand px-4 text-label font-medium text-white">
              Press me
            </Pressable>
            <span className="text-label text-text-3">
              whileTap scale 0.98, 120 ms spring
            </span>
          </div>

          <HoverLift className="rounded-card border border-line bg-surface p-4">
            <p className="text-label text-text-2">
              Hover lift — 2 px, spring.ui. Shadow shifts from card to lift.
            </p>
          </HoverLift>

          <Reveal className="rounded-card border border-line bg-surface p-4">
            <p className="text-label text-text-2">
              Reveal — fades and lifts 16 px once when it enters the viewport.
            </p>
          </Reveal>

          <Stagger className="grid gap-2 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <StaggerItem
                key={item}
                className="rounded-card border border-line bg-surface-2 p-3 text-label text-text-2"
              >
                Stagger item {item + 1}
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Section>
    </main>
  )
}
