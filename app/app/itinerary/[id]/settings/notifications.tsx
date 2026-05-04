import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Bell, MessageSquare, Calendar, Star } from 'lucide-react-native';

export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const [mentions, setMentions] = React.useState(true);
  const [updates, setUpdates] = React.useState(true);
  const [voting, setVoting] = React.useState(false);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#94a3b8" size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>
            Configure how you want to be notified about activity in this trip.
          </Text>

          <View style={styles.group}>
            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <MessageSquare size={20} color="#818cf8" />
              </View>
              <View style={styles.info}>
                <Text style={styles.label}>Chat Mentions</Text>
                <Text style={styles.sub}>When someone tags you in the AI assistant</Text>
              </View>
              <Switch value={mentions} onValueChange={setMentions} trackColor={{ true: '#818cf8' }} />
            </View>

            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Calendar size={20} color="#f43f5e" />
              </View>
              <View style={styles.info}>
                <Text style={styles.label}>Itinerary Updates</Text>
                <Text style={styles.sub}>When a plan or date is changed</Text>
              </View>
              <Switch value={updates} onValueChange={setUpdates} trackColor={{ true: '#f43f5e' }} />
            </View>

            <View style={styles.item}>
              <View style={styles.iconContainer}>
                <Star size={20} color="#fbbf24" />
              </View>
              <View style={styles.info}>
                <Text style={styles.label}>Voting Activity</Text>
                <Text style={styles.sub}>When members vote on destinations</Text>
              </View>
              <Switch value={voting} onValueChange={setVoting} trackColor={{ true: '#fbbf24' }} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20, justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1e293b' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: '800' },
  content: { padding: 24 },
  description: { color: '#64748b', fontSize: 14, marginBottom: 32, lineHeight: 20 },
  group: { backgroundColor: 'rgba(15, 23, 42, 0.4)', borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(15, 23, 42, 0.5)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 16 },
  label: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  sub: { color: '#64748b', fontSize: 12, marginTop: 2 },
});
