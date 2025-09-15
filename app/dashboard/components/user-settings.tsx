"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { createSupabaseClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  Lock, 
  Download, 
  Save, 
  Key,
  Shield,
  Database,
  Settings as SettingsIcon,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
};

export function UserSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/10">
          <CardContent className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: displayName }
      });

      if (error) throw error;
      
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(`Failed to save settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setPasswordLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      toast.success("Password updated successfully.");
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const supabase = createSupabaseClient();
      const { data: polls, error: pollsError } = await supabase
        .from('polls')
        .select('*, poll_options(*), votes(*)')
        .eq('user_id', user.id);

      if (pollsError) {
        throw new Error(pollsError.message);
      }

      // Create CSV content
      const csvRows = [
        ['Poll ID', 'Question', 'Description', 'Created', 'Option', 'Votes'].join(',')
      ];

      polls?.forEach(poll => {
        const baseRow = [poll.id, poll.question, poll.description || '', poll.created_at];
        if (poll.poll_options?.length > 0) {
          poll.poll_options.forEach((option: any) => {
            const voteCount = poll.votes?.filter((v: any) => v.option_id === option.id).length || 0;
            csvRows.push([...baseRow, option.text, voteCount].join(','));
          });
        } else {
          csvRows.push([...baseRow, '', '0'].join(','));
        }
      });

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `votelyst_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = newPassword.length === 0 ? 0 : 
    newPassword.length < 6 ? 1 :
    newPassword.length < 8 ? 2 :
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword) ? 4 : 3;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 dark:bg-gray-700">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <SettingsIcon className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your account preferences and security settings
            </p>
          </motion.div>

          {/* Account Information */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="display-name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Display Name
                    </Label>
                    <Input
                      id="display-name"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        disabled
                        className="h-12 bg-muted/50"
                      />
                      <Badge variant="secondary" className="absolute right-2 top-2.5 text-xs">
                        Verified
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleSaveSettings} 
                    disabled={loading}
                    className="w-full md:w-auto h-12 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Security */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Lock className="h-5 w-5" />
                  Password Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        className="h-12 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password strength indicator */}
                    {newPassword && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Password strength:</span>
                          <span className={
                            passwordStrength === 4 ? "text-green-600" :
                            passwordStrength === 3 ? "text-yellow-600" :
                            passwordStrength === 2 ? "text-orange-600" : "text-red-600"
                          }>
                            {passwordStrength === 4 ? "Strong" :
                             passwordStrength === 3 ? "Good" :
                             passwordStrength === 2 ? "Fair" : "Weak"}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordStrength === 4 ? "bg-green-500 w-full" :
                              passwordStrength === 3 ? "bg-yellow-500 w-3/4" :
                              passwordStrength === 2 ? "bg-orange-500 w-1/2" : "bg-red-500 w-1/4"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-12 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1 h-10 w-10"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {confirmPassword && (
                      <div className="flex items-center gap-2 text-xs">
                        {newPassword === confirmPassword ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            <span className="text-red-600">Passwords don't match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleChangePassword} 
                    disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}
                    className="w-full md:w-auto h-12 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Data Export */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-muted/20 dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5" />
                  Data Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Download className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Export Your Data</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Download a complete copy of all your polls, options, and voting data in CSV format. 
                      This includes poll questions, descriptions, options, and vote counts.
                    </p>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        variant="outline" 
                        onClick={handleExportData} 
                        disabled={loading}
                        className="h-12 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {loading ? 'Exporting...' : 'Export My Data'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}