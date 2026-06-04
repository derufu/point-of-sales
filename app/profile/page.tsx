"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Edit2, Save, X } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  joinDate: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Business owner and POS system enthusiast.",
    joinDate: "January 15, 2025",
  });

  const [formData, setFormData] = useState(profile);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    setProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            POS System
          </span>
        </Link>
        <div className="flex gap-4">
          <Link href="/auth">
            <Button>Sign Out</Button>
          </Link>
        </div>
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
                <span className="text-4xl font-bold text-white">JD</span>
              </div>
              <div>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {profile.name}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Member since {profile.joinDate}
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
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-50 dark:placeholder-zinc-400"
                  />
                ) : (
                  <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                    {profile.email}
                  </p>
                )}
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
                    {profile.phone}
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
                    {profile.location}
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
                    {profile.bio}
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

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link href="/profile/settings">
              <div className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Settings
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Manage your account preferences
                </p>
              </div>
            </Link>
            <Link href="/profile/security">
              <div className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-zinc-800">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                  Security
                </h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Update your password and security settings
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
