"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, User, Sparkles, Heart, Mail, Linkedin, XIcon } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="space-y-6">

      <div className="grid gap-6">
        {/* Company Info Card */}
        <Card>
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center py-6">
              {/* Replace with actual 1xAI logo */}
              <div className="relative">
                <img 
                  src="/images/1xAI.PNG" 
                  alt="1xAI Logo" 
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    // Fallback to text logo if image doesn't exist
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="bg-primary rounded-full p-8 text-primary-foreground hidden">
                  <div className="text-4xl font-bold">1x</div>
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold">1xAI</h3>
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="w-4 h-4 mr-1" />
                AI-Powered Applications
              </Badge>
            </div>

            <div className="text-center text-muted-foreground">
              <p>1xAI is the creator of Zen 🪷 Spa Insights & Operations, an application designed to deliver intelligent analytics and actionable insights using AI-powered technologies.</p>
            </div>

            <div className="text-center space-y-4">
            <h3 className="font-semibold">Contact Us</h3>
            <div className="flex justify-center items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href="mailto:onexai.inc@gmail.com"
                className="text-primary hover:underline"
              >
                onexai.inc@gmail.com
              </a>
            </div>
            <div className="flex justify-center items-center gap-2">
              <Linkedin className="h-4 w-4 text-muted-foreground" />
              <Link
                href="https://www.linkedin.com/company/1xai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Connect on LinkedIn
              </Link>
            </div>
            <div className="flex justify-center items-center gap-2">
                <XIcon />
                <Link
                    href="https://x.com/onexai_inc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                >
                    Follow on X
                </Link>
            </div>
          </div>
          </CardContent>
        </Card>

      </div>

      {/* Application Info Card */}
      <Card>
        <CardHeader>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">📊</div>
              <h4 className="font-semibold mt-2">Smart Analytics</h4>
              <p className="text-sm text-muted-foreground">Insights for better decision making</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">⚡</div>
              <h4 className="font-semibold mt-2">Streamlined Operations</h4>
              <p className="text-sm text-muted-foreground">Manage daily operations efficiently</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">🎯</div>
              <h4 className="font-semibold mt-2">Growth Focused</h4>
              <p className="text-sm text-muted-foreground">Tools designed to scale your business</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
