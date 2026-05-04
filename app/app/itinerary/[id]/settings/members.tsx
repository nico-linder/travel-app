import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, UserPlus, Shield, User, X, Mail } from 'lucide-react-native';
import { supabase } from '../../../../lib/supabase';

export default function ManageMembersScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, [id]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_members')
        .select('*, users(display_name, avatar_url)')
        .eq('trip_id', id);
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#94a3b8" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Trip Members</Text>
          <TouchableOpacity style={styles.addButton}>
            <UserPlus color="#818cf8" size={24} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inviteCard}>
            <View style={styles.inviteIcon}>
              <Mail color="#818cf8" size={24} />
            </View>
            <View style={styles.inviteInfo}>
              <Text style={styles.inviteTitle}>Invite with Code</Text>
              <Text style={styles.inviteSub}>Share the unique trip code with friends</Text>
            </View>
            <TouchableOpacity style={styles.copyButton}>
              <Text style={styles.copyText}>Share</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Active Members ({members.length})</Text>

          {loading ? (
            <ActivityIndicator color="#818cf8" style={{ marginTop: 20 }} />
          ) : (
            <View style={styles.memberList}>
              {members.map((member) => (
                <View key={member.id} style={styles.memberItem}>
                  <Image 
                    source={{ uri: member.users?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80' }} 
                    style={styles.avatar} 
                  />
                  <View style={styles.memberInfo}>
                    <Text style={styles.memberName}>{member.users?.display_name || 'Member'}</Text>
                    <View style={styles.roleBadge}>
                      <Shield size={10} color="#64748b" />
                      <Text style={styles.roleText}>{member.role.toUpperCase()}</Text>
                    </View>
                  </View>
                  {member.role !== 'admin' && (
                    <TouchableOpacity style={styles.removeButton}>
                      <X size={18} color="#475569" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(129, 140, 248, 0.05)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
    marginBottom: 32,
  },
  inviteIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  inviteTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  inviteSub: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  copyButton: {
    backgroundColor: '#818cf8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  copyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  memberList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#1e293b',
  },
  memberInfo: {
    flex: 1,
    marginLeft: 16,
  },
  memberName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  roleText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  removeButton: {
    padding: 8,
  },
});
