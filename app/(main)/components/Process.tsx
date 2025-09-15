"use client";

import { motion, Variants, easeInOut } from "framer-motion";
import { Edit3, Share2, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: "Create Your Poll",
    description: "Add your question and options using our intuitive poll builder. Customize settings like voting limits, privacy, and end dates.",
    icon: Edit3,
    color: "from-blue-500 to-cyan-500",
    features: ["Unlimited options", "Rich text formatting", "Privacy controls"]
  },
  {
    number: 2,
    title: "Share & Collect Votes",
    description: "Share your poll via link, QR code, or social media. Watch votes come in real-time on your dashboard.",
    icon: Share2,
    color: "from-emerald-500 to-teal-500",
    features: ["QR code generation", "Social media sharing", "Real-time updates"]
  },
  {
    number: 3,
    title: "Analyze Results",
    description: "Get detailed analytics with beautiful charts, export data, and make informed decisions based on insights.",
    icon: BarChart3,
    color: "from-purple-500 to-pink-500",
    features: ["Interactive charts", "Data export", "Detailed analytics"]
  }
];

// Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.6,
    },
  },
};

const iconVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.1, 
    rotate: 360,
    transition: { 
      duration: 0.8, 
      ease: easeInOut, // ✅ Use imported easing
    }
  }
};

export function Process() {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Create your first poll in{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              3 simple steps
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our streamlined process makes it easy to create, share, and analyze polls in minutes
          </p>
        </motion.div>

        {/* Steps */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-24 left-full w-12 h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0">
                  <motion.div
                    className="w-full h-full bg-gradient-to-r from-primary to-purple-600"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.3 }}
                    viewport={{ once: true }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}

              <div className="text-center relative z-10">
                {/* Step number and icon */}
                <motion.div 
                  className="relative mb-8"
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-2xl relative`}>
                    {step.number}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${step.color} opacity-20 blur-xl scale-150`}></div>
                  </div>
                  
                  {/* Icon overlay */}
                  <motion.div 
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-background rounded-xl border-2 border-border flex items-center justify-center shadow-lg"
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <step.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                </motion.div>

                {/* Content */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed mb-6">{step.description}</p>

                  {/* Feature list */}
                  <div className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <motion.div
                        key={featureIndex}
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.2 + featureIndex * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-purple-600/10 px-6 py-3 rounded-full border border-primary/20">
            <span className="text-sm font-medium">Ready to get started?</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
