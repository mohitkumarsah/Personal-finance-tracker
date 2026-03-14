import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/context/FinanceContext';
import { Currency, CURRENCY_SYMBOLS } from '@/types/finance';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Palette, Globe, Shield, LogOut, User, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { currency, setCurrency, isDarkMode, toggleDarkMode, user, logout, updateProfile } = useFinance();
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPersonalDetailsForm, setShowPersonalDetailsForm] = useState(false);
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');

  useEffect(() => {
    if (user) {
      setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
      setEmail(user.email || '');
      setDateOfBirth(user.user_metadata?.dateOfBirth || '');
      setMobileNumber(user.user_metadata?.mobileNumber || '');
      setCity(user.user_metadata?.city || '');
      setPinCode(user.user_metadata?.pinCode || '');
    }
  }, [user]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-heading font-bold">Settings</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold">Account</h2>
        </div>
        {user ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <div>
                <Label>Username</Label>
                <p className="text-sm text-muted-foreground mt-1">{username}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Personal Details</Label>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-muted-foreground"><strong>Email:</strong> {email}</p>
                    <p className="text-sm text-muted-foreground"><strong>Date of Birth:</strong> {dateOfBirth || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground"><strong>Mobile:</strong> {mobileNumber || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground"><strong>City:</strong> {city || 'Not set'}</p>
                    <p className="text-sm text-muted-foreground"><strong>Pin Code:</strong> {pinCode || 'Not set'}</p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowUsernameForm((prev) => !prev)}>
                      {showUsernameForm ? 'Cancel Username Update' : 'Change Username'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPersonalDetailsForm((prev) => !prev)}>
                      {showPersonalDetailsForm ? 'Cancel Personal Details Update' : 'Update Personal Details'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPasswordForm((prev) => !prev)}>
                      {showPasswordForm ? 'Cancel Password Update' : 'Update Password'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {showUsernameForm && (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      await updateProfile({ username });
                      toast.success('Username updated');
                      setShowUsernameForm(false);
                    } catch {
                      // toast handled by updateProfile
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div>
                    <Label>New Username</Label>
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your display name"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving…' : 'Update Username'}
                  </Button>
                </form>
              )}

              {showPersonalDetailsForm && (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      await updateProfile({
                        dateOfBirth,
                        mobileNumber,
                        city,
                        pinCode,
                      });
                      toast.success('Personal details updated');
                      setShowPersonalDetailsForm(false);
                    } catch {
                      // toast handled by updateProfile
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div>
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Mobile Number</Label>
                    <Input
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Your mobile number"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>City</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Your city"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Pin Code</Label>
                    <Input
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="Your pin code"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving…' : 'Update Personal Details'}
                  </Button>
                </form>
              )}

              {showPasswordForm && (
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!oldPassword || !newPassword) {
                      toast.error('Please fill both current and new password.');
                      return;
                    }
                    setSaving(true);
                    try {
                      await updateProfile({
                        oldPassword,
                        newPassword,
                      });
                      setOldPassword('');
                      setNewPassword('');
                      setShowPasswordForm(false);
                      toast.success('Password updated');
                    } catch {
                      // toast handled by updateProfile
                    } finally {
                      setSaving(false);
                    }
                  }}
                >
                  <div>
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter a new password"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You must enter your current password to change to a new one.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Saving…' : 'Update Password'}
                  </Button>
                </form>
              )}
            </div>

            <Button variant="outline" className="w-full" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Not signed in. Your data is stored locally.
          </p>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold">Currency</h2>
        </div>
        <div>
          <Label>Select Currency</Label>
          <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(CURRENCY_SYMBOLS) as Currency[]).map(c => (
                <SelectItem key={c} value={c}>{CURRENCY_SYMBOLS[c]} {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="font-heading font-semibold">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label>Dark Mode</Label>
            <p className="text-xs text-muted-foreground">Switch between light and dark themes</p>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
        </div>
      </motion.div>
    </div>
  );
}
