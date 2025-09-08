"use client"; // This directive marks the component as a Client Component in Next.js

import Link from "next/link"; // For client-side navigation
import { Button } from "@/components/ui/button"; // Shadcn UI Button component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn UI Card components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Shadcn UI Avatar components
import {
  Twitter,
  ArrowLeft,
  Users,
  UserCheck,
  TrendingUp,
  LogOut,
} from "lucide-react"; // Icons from Lucide React
import { useEffect, useState } from "react"; // React hooks for state and side effects

// Define the ProfilePage functional component
export default function ProfilePage() {
  // State to hold the user data fetched from the API
  const [me, setMe] = useState<any>(null); // Using 'any' for now, consider defining a proper interface for 'me'

  // useEffect hook to fetch user data when the component mounts
  useEffect(() => {
    const fetchMe = async () => {
      try {
        // Fetch user data from your backend API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/me`, {
          credentials: "include", // Important for sending cookies/auth tokens
        });

        // Check if the response was successful
        if (res.ok) {
          const data = await res.json(); // Parse the JSON response
          setMe(data); // Update the 'me' state with fetched data
        } else {
          // Log an error if the API call was not successful
          console.error(
            "Failed to fetch profile data:",
            res.status,
            res.statusText,
          );
        }
      } catch (err) {
        // Catch any network or parsing errors
        console.error("Error fetching profile:", err);
      }
    };

    fetchMe(); // Call the fetch function
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Render a loading state if user data is not yet available
  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading profile data...</p>
      </div>
    );
  }

  // Calculate success rate, handling potential division by zero
  const successRate =
    me.followedCount > 0 ? (me.followedBackCount / me.followedCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Back to Directory Button */}
              <Link href="/directory">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Directory
                </Button>
              </Link>
              {/* Platform Branding */}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-black">
                  F4F Exchange
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header Card */}
        <Card className="border border-gray-200 shadow-sm mb-8 rounded-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* User Avatar */}
              <Avatar className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-blue-300 shadow-md">
                <AvatarImage
                  src={me.avatar_url || "/placeholder.svg"}
                  alt={me.name}
                />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-800">
                  {/* Display initials if avatar image is not available */}
                  {me.name
                    ? me.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                    : "UN"}{" "}
                  {/* Fallback for undefined name */}
                </AvatarFallback>
              </Avatar>

              {/* User Name and Handle */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-2xl font-bold text-black mb-1">
                  {me.name || "Unnamed User"}
                </h1>
                <p className="text-gray-600 mb-2">
                  {me.handle || "@no-handle"}
                </p>
                <p className="text-sm text-gray-500">
                  Member since {me.joinDate || "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Users Followed Card */}
          <Card className="border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Users Followed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-1">
                {me.followedCount || 0}
              </div>
              <p className="text-sm text-gray-600">
                Total users you've followed
              </p>
            </CardContent>
          </Card>

          {/* Followed Back Card */}
          <Card className="border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <UserCheck className="w-5 h-5 mr-2 text-green-600" />
                Followed Back
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-1">
                {me.followedBackCount || 0}
              </div>
              <p className="text-sm text-gray-600">
                Users who followed you back
              </p>
            </CardContent>
          </Card>

          {/* Mutual Follows Card */}
          <Card className="border border-gray-200 shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-gray-800">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Mutual Follows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-black mb-1">
                {me.mutualCount || 0}
              </div>
              <p className="text-sm text-gray-600">Mutual connections made</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Rate Card */}
        <Card className="border border-gray-200 shadow-sm mb-8 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Follow-Back Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Success Rate</span>
              <span className="text-sm font-medium text-black">
                {Math.round(successRate)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {me.followedBackCount || 0} out of {me.followedCount || 0} users
              followed you back
            </p>
          </CardContent>
        </Card>

        {/* Account Actions Card */}
        <Card className="border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Account Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/directory" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent rounded-md"
                >
                  Continue Growing
                </Button>
              </Link>
              <Link href="/thank-you" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 bg-transparent rounded-md"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Leave Platform
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Leaving the platform will unlink your Twitter account and remove
              your data.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer Section */}
      <footer className="bg-white border-t border-gray-200 mt-8 py-4 text-center text-gray-500 text-sm shadow-inner">
        <p>
          &copy; {new Date().getFullYear()} F4F Exchange. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
