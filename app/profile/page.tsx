"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Edit2, Save, X, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userData: UserProfile = {
          name: user.user_metadata?.full_name || user.email || "",
          email: user.email || "",
          phone: user.user_metadata?.phone || "",
          location: user.user_metadata?.location || "",
          bio: user.user_metadata?.bio || "",
        };
        setProfile(userData);
        setFormData(userData);
      }
      setLoading(false);
    };

    loadUserProfile();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          phone: formData.phone,
          location: formData.location,
          bio: formData.bio,
        },
      });
      setProfile(formData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            POS System
          </span>
        </Link>
        <form action={logout}>
          <Button variant="destructive" className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </form>
      </nav>

      {/* Profile Content */}
      <section className="flex justify-center px-6 py-12 lg:px-12">
        <div className="w-full max-w-2xl">
          {/* Profile Header */}
          <div className="rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  My Profile
                </h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                  Manage your account information
                </p>
              </div>
              <button
                onClick={() =>
                  isEditing ? handleCancel() : setIsEditing(true)
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isEditing ? (
                  <>
                    <X className="h-5 w-5" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-5 w-5" />
                    Edit
                  </>
                )}
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="mt-8 flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {profile.name || "User"}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {profile.email}
                </p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="mt-8 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                ) : (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  {profile.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <Phone className="h-4 w-4" />
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                ) : (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.phone || "Not provided"}
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                ) : (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.location || "Not provided"}
                  </p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                ) : (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.bio || "Not provided"}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Save className="h-5 w-5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className="rounded-lg border border-zinc-300 px-6 py-2 text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
