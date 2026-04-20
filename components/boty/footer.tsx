"use client"

import Link from "next/link"
import { Instagram, Github, Twitter, Shield, Lock, Globe } from "lucide-react"

const footerLinks = {
  events: [
    { name: "Browse Events", href: "/events" },
    { name: "Private Events", href: "/events?type=private" },
    { name: "Public Events", href: "/events?type=public" },
    { name: "My Tickets", href: "/tickets" }
  ],
  create: [
    { name: "Create Event", href: "/dashboard/create" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/dashboard/events" },
    { name: "Settings", href: "/dashboard/settings" }
  ],
  privacy: [
    { name: "How It Works", href: "/privacy" },
    { name: "Fhenix Protocol", href: "#" },
    { name: "Documentation", href: "#" },
    { name: "GitHub", href: "#" }
  ],
  support: [
    { name: "Help Center", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Privacy Policy", href: "#" }
  ]
}

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden border-t border-border">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="text-[200px] sm:text-[200px] md:text-[400px] lg:text-[400px] xl:text-[400px] font-bold text-foreground/5 whitespace-nowrap leading-none">
          EventNest
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-3xl text-foreground mb-4">
              <span className="gradient-text font-semibold">Event</span>Nest
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Privacy-first decentralized event ticketing powered by Fhenix Fully Homomorphic Encryption.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Events Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Events</h3>
            <ul className="space-y-3">
              {footerLinks.events.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Create Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Create</h3>
            <ul className="space-y-3">
              {footerLinks.create.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Privacy</h3>
            <ul className="space-y-3">
              {footerLinks.privacy.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Privacy Badge */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 pb-8 border-b border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Lock className="w-4 h-4 text-primary" />
            <span>Fhenix Powered</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Globe className="w-4 h-4 text-primary" />
            <span>Decentralized</span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EventNest. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
