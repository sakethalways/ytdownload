'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2 mb-4 sm:mb-6 text-xs sm:text-sm"
            size="sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1.5 sm:mb-2">Terms and Conditions</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Last Updated: February 13, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-3 sm:space-y-4 md:space-y-6">
          {/* 1. Acceptance of Terms */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">1. Acceptance of Terms</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              By accessing and using this YouTube Downloader tool, you agree to be bound by these Terms
              and Conditions. If you do not agree to any part of these terms, you may not use this
              application.
            </p>
          </Card>

          {/* 2. Purpose and Permitted Use */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">2. Purpose and Permitted Use</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              This tool is provided for personal and educational use only. You may use this application
              to download videos or extract audio only when:
            </p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground ml-2">
              <li>You own the content or have explicit written permission from the content owner</li>
              <li>The use is for non-commercial, personal purposes</li>
              <li>The use complies with YouTube's Terms of Service</li>
              <li>The use complies with all applicable local, state, and federal laws</li>
              <li>The use does not violate any copyright or intellectual property rights</li>
            </ul>
          </Card>

          {/* 3. Prohibited Uses */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">3. Prohibited Uses</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">You are expressly prohibited from:</p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground ml-2">
              <li>Downloading copyrighted content without authorization or proper licensing</li>
              <li>Commercial distribution or sale of downloaded content</li>
              <li>Using this tool to circumvent YouTube's access controls or DRM protections</li>
              <li>Violating YouTube's Terms of Service or any third-party rights</li>
              <li>Using the tool for illegal purposes or in any unlawful manner</li>
              <li>Attempting to reverse-engineer or modify the application</li>
              <li>Using the tool to download content from accounts that are not yours without permission</li>
            </ul>
          </Card>

          {/* 4. Copyright and Intellectual Property */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">4. Copyright and Intellectual Property</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              You acknowledge and agree that all content on YouTube is protected by copyright and
              other intellectual property laws. By downloading content, you assume full responsibility
              for ensuring that your use does not infringe upon any copyrights or other rights of third
              parties. The developers of this application do not warrant or assume any liability for
              copyright infringement.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Users of this tool must obtain proper licensing or permissions from copyright holders
              before legally downloading protected content.
            </p>
          </Card>

          {/* 5. Limitation of Liability */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-3">
              THIS APPLICATION IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. THE DEVELOPERS AND
              CREATORS OF THIS TOOL DISCLAIM ALL REPRESENTATIONS AND WARRANTIES, EXPRESS OR IMPLIED,
              INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground ml-2">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranty that the service will be uninterrupted or error-free</li>
              <li>Warranty regarding the accuracy or reliability of downloaded content</li>
            </ul>
            <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
              IN NO EVENT SHALL THE DEVELOPERS BE LIABLE FOR ANY DAMAGES, INCLUDING BUT NOT LIMITED TO
              DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, ARISING FROM
              YOUR USE OR INABILITY TO USE THIS APPLICATION.
            </p>
          </Card>

          {/* 6. Assumption of Risk */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">6. Assumption of Risk</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              You acknowledge and assume all risk associated with using this application, including but
              not limited to legal liability for copyright infringement, violation of YouTube's Terms of
              Service, and any other unlawful use. You agree to indemnify and hold harmless the
              developers from any claims arising from your misuse of this tool.
            </p>
          </Card>

          {/* 7. Compliance with Laws */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">7. Compliance with Laws</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">You agree to comply with all applicable laws and regulations, including:</p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground ml-2">
              <li>Digital Millennium Copyright Act (DMCA) and similar laws in your jurisdiction</li>
              <li>YouTube's Terms of Service</li>
              <li>All local, state, and federal copyright laws</li>
              <li>All international copyright treaties and agreements</li>
            </ul>
          </Card>

          {/* 8. YouTube Terms of Service */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">8. YouTube Terms of Service</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              This application is an independent tool and is not affiliated with, endorsed by, or
              sponsored by YouTube or Google. By using this tool, you acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground ml-2">
              <li>You have read and understand YouTube's Terms of Service</li>
              <li>Downloading content may violate YouTube's policies</li>
              <li>The developers are not responsible for your compliance with YouTube's policies</li>
              <li>YouTube may take action against accounts that engage in unauthorized downloads</li>
            </ul>
          </Card>

          {/* 9. Disclaimer */}
          <Card className="p-3 sm:p-4 md:p-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-amber-900 dark:text-amber-200">9. Legal Disclaimer</h2>
            <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300">
              Users are solely responsible for ensuring their use of downloaded content complies with
              YouTube's Terms of Service and all applicable copyright laws. The developers of this
              application disclaim all liability for unauthorized use, copyright infringement, or
              violations of YouTube's policies. By using this tool, you accept full legal responsibility
              for your actions and agree to defend and indemnify the developers against any claims,
              damages, or legal expenses arising from your use of this application.
            </p>
          </Card>

          {/* 10. Modifications to Terms */}
          <Card className="p-3 sm:p-4 md:p-6">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3">10. Modifications to Terms</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We reserve the right to modify these Terms and Conditions at any time. Continued use of
              this application constitutes acceptance of any modifications. It is your responsibility to
              review these terms periodically.
            </p>
          </Card>

          {/* 11. Acknowledgment */}
          <Card className="p-3 sm:p-4 md:p-6 border-red-500/50 bg-red-50 dark:bg-red-950/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-red-900 dark:text-red-200">Acknowledgment</h2>
            <p className="text-xs sm:text-sm text-red-800 dark:text-red-300 font-semibold">
              By using this application, you acknowledge that you have read these Terms and Conditions
              in their entirety, fully understand their implications, and accept full legal responsibility
              for your use of this tool. You further acknowledge that the developers assume no liability
              for any damages, legal consequences, or violations arising from your use of this application.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-3 sm:p-4 md:p-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/30">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-blue-900 dark:text-blue-200">Contact</h2>
            <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300 mb-2 sm:mb-3">
              If you have any questions, concerns, or inquiries about these Terms and Conditions or the YouTube Downloader application, please feel free to reach out to us.
            </p>
            <div className="bg-white dark:bg-slate-950 rounded-lg p-2.5 sm:p-3 border border-blue-200 dark:border-blue-800">
              <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Email:</p>
              <a 
                href="mailto:muthyapuwarsaketh@gmail.com"
                className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline break-all"
              >
                muthyapuwarsaketh@gmail.com
              </a>
            </div>
          </Card>

          {/* Back Button */}
          <div className="flex gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Button onClick={() => router.back()} size="sm" className="w-full text-xs sm:text-sm">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Back to Downloader
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
