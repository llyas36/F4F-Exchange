"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Twitter, LogOut, User, BarChart3 } from "lucide-react";

interface UserData {
  id: number;
  username: string;
  avatar_url: string | null;
  is_followed: boolean;
  follows_me: boolean;
  mutual: boolean;
}

interface FormattedUser {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  followed: boolean;
  followsMe: boolean;
  mutual: boolean;
}

export default function DirectoryPage() {
  const [me, setMe] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const [users, setUsers] = useState<FormattedUser[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");

  // Step 1: Move fetchData() outside useEffect and make it reusable
  const fetchData = useCallback(async () => {
    try {
      const options = { credentials: "include" };

      const meRes = await fetch(`${apiUrl}/api/me`, options);

      if (meRes.status === 401) {
        window.location.href = `${apiUrl}/auth/twitter?next=/directory`;
        return;
      }

      const usersRes = await fetch(`${apiUrl}/api/users`, options);

      if (meRes.ok) setMe(await meRes.json());

      if (usersRes.ok) {
        const usersData: UserData[] = await usersRes.json();

        const formattedUsers: FormattedUser[] = usersData.map((user) => ({
          id: user.id,
          name: user.username,
          handle: "@" + user.username,
          avatar: user.avatar_url || "/placeholder.svg",
          followed: user.is_followed, // <-- use backend values here
          followsMe: user.follows_me,
          mutual: user.mutual,
        }));
        setUsers(formattedUsers);
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err);
    }
  }, [apiUrl]); // fetchData depends on apiUrl

  // Step 2: Reuse fetchData() in useEffect
  useEffect(() => {
    fetchData();
  }, [apiUrl, fetchData]); // Add fetchData to dependency array

  const handleFollow = async (userId: number) => {
    try {
      const res = await fetch(`${apiUrl}/api/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ user_id: userId }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Follow error:", result.error);
        return;
      }

      // Step 3: Update handleFollow() to trigger a refresh
      await fetchData(); // ✅ This triggers fresh backend state
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const filteredUsers = users.filter((user) => {
    switch (activeFilter) {
      case "not-followed":
        return !user.followed;
      case "follows-me":
        return user.followsMe;
      case "mutuals":
        return user.mutual;
      default:
        return true;
    }
  });

  const filterTabs = [
    { id: "all", label: "All", count: users.length },
    {
      id: "not-followed",
      label: "Not Followed Yet",
      count: users.filter((u) => !u.followed).length,
    },
    {
      id: "follows-me",
      label: "Followed Me",
      count: users.filter((u) => u.followsMe).length,
    },
    {
      id: "mutuals",
      label: "Mutuals",
      count: users.filter((u) => u.mutual).length,
    },
  ];

  if (!me) return <p className="p-8 text-center">Loading...boo for life</p>;
  console.log("Filtered users:", filteredUsers);
  console.log("All users:", users);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Twitter className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-black">F4F Exchange</span>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-black"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-black"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Stats
                </Button>
              </Link>
              <Link href="/thank-you">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-black"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">F4F Directory</h1>
          <p className="text-gray-600">
            Connect with other Twitter users and grow your following together.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeFilter === tab.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(tab.id)}
                className={
                  activeFilter === tab.id
                    ? "bg-black text-white hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }
              >
                {tab.label}
                <Badge
                  variant="secondary"
                  className="ml-2 bg-gray-100 text-gray-600"
                >
                  {tab.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* User List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="border border-gray-200 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-black">
                          {user.name}
                        </h3>
                        {user.mutual && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            Mutual
                          </Badge>
                        )}
                        {user.followsMe && !user.mutual && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            Follows You
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm">{user.handle}</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleFollow(user.id)}
                    variant={user.followed ? "outline" : "default"}
                    size="sm"
                    className={
                      user.followed
                        ? "border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        : "bg-black text-white hover:bg-gray-800"
                    }
                  >
                    {user.followed ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">
                No users found for the selected filter.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
