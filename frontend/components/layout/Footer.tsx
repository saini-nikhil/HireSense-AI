import Link from "next/link";
import { Bot, Code, Link as LinkIcon, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">HireSense</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered career coaching: resume analysis, job matching, and interview practice.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Website"
              >
                <LinkIcon className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Community"
              >
                <MessageCircle className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Source code"
              >
                <Code className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/resumeanalyzer" className="text-gray-400 hover:text-white transition-colors">
                  Resume Analyzer
                </Link>
              </li>
              <li>
                <Link href="/interviewcoach" className="text-gray-400 hover:text-white transition-colors">
                  Interview Coach
                </Link>
              </li>
              <li>
                <Link href="/jobfinder" className="text-gray-400 hover:text-white transition-colors">
                  Job Finder
                </Link>
              </li>
              <li>
                <Link href="/resumebuilder" className="text-gray-400 hover:text-white transition-colors">
                  Resume Builder
                </Link>
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
            © {new Date().getFullYear()} HireSense AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

