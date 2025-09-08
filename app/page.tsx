import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Users, UserCheck, TrendingUp } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">F4F Exchange</span>
          </div>
          <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/twitter`}>
  <Button
    variant="outline"
    className="border-black text-black hover:bg-black hover:text-white bg-transparent"
  >
    Sign In with Twitter
  </Button>
</a>

        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
          Grow Your Twitter Followers – <span className="text-gray-600">Join the F4F Exchange</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Follow others and get followed back. 100% real Twitter users in our trusted community.
        </p>

        <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/twitter`}>
  <Button
    variant="outline"
    className="border-black text-black hover:bg-black hover:text-white bg-transparent"
  >
    Sign In with Twitter
  </Button>
</a>

      </section>

      {/* Features Preview */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Real Users</h3>
              <p className="text-gray-600">
                Connect with genuine Twitter users looking to grow their following organically.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Fair Exchange</h3>
              <p className="text-gray-600">
                Follow others and get followed back. Track your mutual connections easily.
              </p>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Track Growth</h3>
              <p className="text-gray-600">Monitor your follower growth and engagement with detailed statistics.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Directory Preview */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-black mb-8">See Who's in the Community</h2>
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <div className="w-20 h-4 bg-gray-300 rounded mb-1"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="w-16 h-8 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 mt-6">Join to see the full directory of users</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600">© 2024 F4F Exchange. Helping Twitter users grow together.</p>
        </div>
      </footer>
    </div>
  )
}
