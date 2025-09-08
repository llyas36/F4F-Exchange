import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Twitter, Heart, ArrowRight } from "lucide-react"

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="border border-gray-200 shadow-lg">
          <CardContent className="p-8 text-center">
            {/* Logo */}
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <Twitter className="w-8 h-8 text-white" />
            </div>

            {/* Thank You Message */}
            <h1 className="text-2xl font-bold text-black mb-4">Thanks for using F4F Exchange!</h1>

            <p className="text-gray-600 mb-6 leading-relaxed">
              We hope you've grown your Twitter following and made meaningful connections. Come back anytime to continue
              growing your network.
            </p>

            {/* Stats Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                <Heart className="w-4 h-4 text-red-500" />
                <span>You helped grow the Twitter community</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full bg-black hover:bg-gray-800 text-white">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Return to Homepage
                </Button>
              </Link>

              <Link href="/directory" className="block">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Sign In Again
                </Button>
              </Link>
            </div>

            {/* Footer Message */}
            <p className="text-xs text-gray-500 mt-6">
              Your account has been safely disconnected. No data is stored on our servers.
            </p>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Questions? Contact us at{" "}
            <a href="mailto:support@f4fexchange.com" className="text-black hover:underline">
              support@f4fexchange.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
