"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Search,
  FileText,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  Users,
  TrendingUp,
  Shield,
  Star,
  Mail,
  Phone,
  MapPin,
  Link,
  MessageCircle,
  Code,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#" },
    { name: "Features", href: "#features" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Interview Coach",
      description:
        "Practice with intelligent voice-enabled AI recruiter tailored to your profile",
      gradient: "from-purple-500/20 to-purple-600/10",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Resume Analysis",
      description:
        "Get instant AI-powered resume scoring and optimization suggestions",
      gradient: "from-blue-500/20 to-blue-600/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
    },
    {
      icon: <Search className="w-8 h-8" />,
      title: "Smart Job Matching",
      description:
        "Discover curated opportunities that match your skills and market value",
      gradient: "from-green-500/20 to-green-600/10",
      iconBg: "bg-green-500/10",
      iconColor: "text-green-400",
    },
  ];

  const stats = [
    { number: "10K+", label: "Resumes Analyzed" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Partner Companies" },
    { number: "24/7", label: "AI Support" },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      content:
        "HireSense AI helped me optimize my resume and land my dream job. The interview practice was invaluable!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Product Manager",
      content:
        "The AI interview coach prepared me better than any human recruiter. Highly recommended!",
      rating: 5,
    },
    {
      name: "Emily Davis",
      role: "UX Designer",
      content:
        "Finally found jobs that actually match my skills. The smart matching is incredibly accurate.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-blue-900/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-900/10 blur-[150px] rounded-full" />
        <div className="absolute top-[50%] left-[50%] w-[25%] h-[25%] bg-green-900/10 blur-[100px] rounded-full" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">HireSense</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {item.name}
                </motion.a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => router.push("/login")}
                className="hidden sm:block px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => router.push("/login")}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                Get Started
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden py-4 border-t border-white/10"
            >
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block py-2 text-gray-300 hover:text-white transition-colors text-sm font-medium"
                >
                  {item.name}
                </a>
              ))}
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-200 to-purple-200">
                Land Your Dream Job
              </span>
              <br />
              <span className="text-3xl sm:text-4xl lg:text-5xl text-gray-300">
                with AI-Powered Career Coaching
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto"
          >
            Transform your job search with intelligent resume analysis, AI
            interview practice, and personalized job matching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-4 border border-white/20 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Watch Demo
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex items-center justify-center gap-8 mt-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Powerful Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to accelerate your career and land your dream
              job
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  if (feature.title === "Resume Analysis") {
                    router.push("/resumeanalyzer");
                  }
                  else if(feature.title === "AI Interview Coach") {
                    router.push("/interviewcoach");
                  }
                  else if(feature.title === "Job Matching") {
                    router.push("/jobmatching");
                  }
                }}
                className={`cursor-pointer relative group p-8 rounded-2xl border border-white/10 bg-gradient-to-br ${feature.gradient} backdrop-blur-xl hover:border-white/20 transition-all`}
              >
                <div
                  className={`w-16 h-16 ${feature.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <div className={feature.iconColor}>{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-400">
                  Why Choose HireSense?
                </span>
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                We combine cutting-edge AI technology with industry expertise to
                provide you with the most comprehensive career development
                platform available.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: <CheckCircle className="w-5 h-5" />,
                    title: "Proven Results",
                    desc: "95% success rate in helping candidates land interviews",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Expert-Backed",
                    desc: "Developed with top recruiters and hiring managers",
                  },
                  {
                    icon: <TrendingUp className="w-5 h-5" />,
                    title: "Career Growth",
                    desc: "Continuous learning and skill development tracking",
                  },
                  {
                    icon: <Shield className="w-5 h-5" />,
                    title: "Privacy First",
                    desc: "Your data is secure and never shared without consent",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="text-green-400 mt-1">{item.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative z-10 p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-6">
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-300 mb-2 italic">
                        "{testimonial.content}"
                      </p>
                      <div>
                        <div className="text-sm font-medium text-white">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/10 backdrop-blur-xl text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who've already landed their
                dream jobs with HireSense AI.
              </p>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all flex items-center gap-2 mx-auto"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HireSense</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Empowering professionals with AI-driven career coaching and job
                matching technology.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Link className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Code className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>info@hiresense.ai</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>San Francisco, CA</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 HireSense AI. All rights reserved. | Privacy Policy | Terms
              of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
