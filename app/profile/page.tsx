'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { AppNav } from '@/components/app-nav';
import { getProfile, updateProfile } from '@/lib/services/profile';
import { logout } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coffee, Loader2 } from 'lucide-react';

interface ProfileData {
  store_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  website: string;
  bio: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    store_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    website: '',
    bio: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      setUser(user);

      // Load profile from database
      const profile = await getProfile(user.id);
      if (profile) {
        setProfileData({
          store_name: profile.store_name || '',
          email: profile.email || user.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          postal_code: profile.postal_code || '',
          country: profile.country || '',
          website: profile.website || '',
          bio: profile.bio || '',
        });
      } else {
        setProfileData((prev) => ({
          ...prev,
          email: user.email || '',
        }));
      }

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateProfile(user.id, profileData);
      // Show success message
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <Coffee className="w-12 h-12 text-amber-600 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppNav />

      <main className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
                Profile
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage your coffee shop details and store information.
              </p>
            </div>
            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>

          {/* Store Information */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Store Information</CardTitle>
              <CardDescription>Your coffee shop details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="storeName" className="text-slate-700 dark:text-slate-300">
                    Store Name
                  </Label>
                  <Input
                    id="storeName"
                    value={profileData.store_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, store_name: e.target.value })
                    }
                    placeholder="My Coffee Shop"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="website" className="text-slate-700 dark:text-slate-300">
                    Website
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">
                  Bio / Description
                </Label>
                <textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Tell us about your coffee shop..."
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Contact Information</CardTitle>
              <CardDescription>How customers can reach you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Address</CardTitle>
              <CardDescription>Your physical store location.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300">
                  Street Address
                </Label>
                <Input
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  placeholder="123 Main St"
                  className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="city" className="text-slate-700 dark:text-slate-300">
                    City
                  </Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="New York"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="state" className="text-slate-700 dark:text-slate-300">
                    State / Province
                  </Label>
                  <Input
                    id="state"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    placeholder="NY"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="postal_code" className="text-slate-700 dark:text-slate-300">
                    Postal Code
                  </Label>
                  <Input
                    id="postal_code"
                    value={profileData.postal_code}
                    onChange={(e) =>
                      setProfileData({ ...profileData, postal_code: e.target.value })
                    }
                    placeholder="10001"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country" className="text-slate-700 dark:text-slate-300">
                    Country
                  </Label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    placeholder="United States"
                    className="bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white dark:bg-slate-800 border-0">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Account Settings</CardTitle>
              <CardDescription>Manage your account preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Sign Out</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Sign out from all devices
                  </p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="rounded-lg"
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
