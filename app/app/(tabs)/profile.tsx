import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, CreditCard, HelpCircle, LogOut, ChevronRight, Moon, Globe, Camera } from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, showArrow = true, color = "#94a3b8" }: any) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}10` }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {value !== undefined && <Text style={styles.settingValue}>{value}</Text>}
      {showArrow && <ChevronRight size={18} color="#475569" />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Account</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80' }} 
                style={styles.avatar} 
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <Camera size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.user_metadata?.full_name || 'Adventurer'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'traveler@example.com'}</Text>
            </View>
            <TouchableOpacity style={styles.editProfileButton}>
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Groups */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Settings</Text>
            <View style={styles.group}>
              <View style={styles.settingItem}>
                <View style={[styles.iconContainer, { backgroundColor: '#818cf810' }]}>
                  <Moon size={20} color="#818cf8" />
                </View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Switch 
                  value={isDarkMode} 
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: '#1e293b', true: '#818cf8' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.settingItem}>
                <View style={[styles.iconContainer, { backgroundColor: '#f43f5e10' }]}>
                  <Bell size={20} color="#f43f5e" />
                </View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Switch 
                  value={notifications} 
                  onValueChange={setNotifications}
                  trackColor={{ false: '#1e293b', true: '#f43f5e' }}
                  thumbColor="#fff"
                />
              </View>
              <SettingItem icon={Globe} label="Language" value="English" color="#10b981" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account &#38; Security</Text>
            <View style={styles.group}>
              <SettingItem icon={Shield} label="Privacy Policy" color="#fbbf24" />
              <SettingItem icon={CreditCard} label="Payment Methods" color="#6366f1" />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.group}>
              <SettingItem icon={HelpCircle} label="Help Center" color="#94a3b8" />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#f43f5e" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.2.4 (2026)</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#818cf8',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  profileEmail: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  editProfileButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    borderRadius: 8,
  },
  editProfileText: {
    color: '#818cf8',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  group: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  settingValue: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    padding: 16,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    gap: 12,
  },
  logoutText: {
    color: '#f43f5e',
    fontSize: 16,
    fontWeight: '800',
  },
  version: {
    color: '#334155',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 32,
    fontWeight: '600',
  },
});
