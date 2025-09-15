'use client';

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { BarChart3, Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const containerVariants: Variants= {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants= {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const linkHoverVariants: Variants= {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <motion.footer 
      className="border-t border-border bg-gradient-to-b from-card to-muted/30 py-12"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/70 rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Votelyst
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Create, share, and analyze polls with ease. Build engaging surveys 
              that capture real insights from your audience.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </motion.div>
              <span>for better decision making</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
            <nav className="space-y-3">
              {[
                { href: '/polls', label: 'Browse Polls' },
                { href: '/polls/new', label: 'Create Poll' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/about', label: 'About Us' }
              ].map((link, index) => (
                <motion.div key={link.href} variants={linkHoverVariants} whileHover="hover" initial="rest">
                  <Link 
                    href={link.href} 
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>

          {/* Legal Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
            <nav className="space-y-3">
              {[
                { href: '/privacy', label: 'Privacy Policy' },
                { href: '/terms', label: 'Terms of Service' },
                { href: '/cookies', label: 'Cookie Policy' },
                { href: '/contact', label: 'Contact Us' }
              ].map((link, index) => (
                <motion.div key={link.href} variants={linkHoverVariants} whileHover="hover" initial="rest">
                  <Link 
                    href={link.href} 
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div 
          variants={itemVariants}
          className="my-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Votelyst. All rights reserved.
            </p>
            <div className="hidden md:block w-px h-4 bg-border" />
            <p className="text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {[
              { 
                icon: Twitter, 
                href: 'https://twitter.com/votelyst', 
                label: 'Twitter',
                color: 'hover:text-blue-500'
              },
              { 
                icon: Github, 
                href: 'https://github.com/votelyst', 
                label: 'GitHub',
                color: 'hover:text-gray-900 dark:hover:text-gray-100'
              },
              { 
                icon: Mail, 
                href: 'mailto:contact@votelyst.com', 
                label: 'Email',
                color: 'hover:text-green-500'
              }
            ].map((social, index) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg bg-muted/50 text-muted-foreground transition-all duration-200 ${social.color} hover:bg-muted`}
                whileHover={{ 
                  scale: 1.1,
                  y: -2,
                  transition: { type: "spring", stiffness: 400, damping: 10 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <social.icon className="h-4 w-4" />
                <span className="sr-only">{social.label}</span>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          transition={{ delay: 1, duration: 1 }}
          viewport={{ once: true }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl" />
        </motion.div>
      </div>
    </motion.footer>
  );
}