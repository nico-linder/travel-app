import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Send } from 'lucide-react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { chatWithAI } from '../lib/googleAI';
import { supabase } from '../lib/supabase';
import { Atlas, Fonts, Radii, eyebrow } from '../constants/atlas';

export const AIChatAssistant = ({
  isOpen,
  onClose,
  tripId,
  tripName,
  inline = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName?: string;
  inline?: boolean;
}) => {
  const [messages, setMessages] = useState<{ id: string; text: string; sender: 'user' | 'ai' }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });
        if (data && data.length > 0) {
          setMessages(data.map((m: any) => ({ id: m.id, text: m.text, sender: m.sender as 'user' | 'ai' })));
        } else {
          setMessages([
            {
              id: 'welcome',
              text: `How can I help with your trip${tripName ? ` to ${tripName}` : ''}?`,
              sender: 'ai',
            },
          ]);
        }
      }
    };
    initChat();
  }, [tripId]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' as const };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      if (userId) {
        await supabase.from('chat_messages').insert({
          trip_id: tripId, user_id: userId, text: userMsg.text, sender: 'user',
        });
      }
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text }],
        }));
      const systemPrompt = tripName
        ? `You are Atlas, an expert travel-planning assistant for a trip to ${tripName}. Be concise, calm, and concrete.`
        : undefined;
      const aiResponse = await chatWithAI(inputText, history, systemPrompt);
      const aiMsg = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai' as const };
      setMessages((prev) => [...prev, aiMsg]);
      if (userId) {
        await supabase.from('chat_messages').insert({
          trip_id: tripId, user_id: userId, text: aiMsg.text, sender: 'ai',
        });
      }
    } catch (error: any) {
      let userMessage = "I hit an error. Try again?";
      if (error.message?.includes('503') || error.message?.includes('high demand')) {
        userMessage = "I'm overloaded. Try again in a moment.";
      } else if (error.message?.includes('429')) {
        userMessage = "Too many requests. Let's pause and try again soon.";
      }
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: userMessage, sender: 'ai' as const }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const Content = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>A</Text></View>
          <View>
            <Text style={styles.headerTitle}>Atlas</Text>
            <Text style={styles.headerStatus}>● online</Text>
          </View>
        </View>
        {!inline && (
          <TouchableOpacity onPress={onClose} style={styles.close} activeOpacity={0.85}>
            <X color={Atlas.paperMute} size={18} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={inline ? 60 : 0}
      >
        <ScrollView
          style={styles.chat}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
              <Text style={[styles.msgText, msg.sender === 'user' ? styles.userText : styles.aiText]}>
                {msg.text}
              </Text>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color={Atlas.amber} />
            </View>
          )}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            { paddingBottom: inline ? (Platform.OS === 'ios' ? 90 : 80) : Platform.OS === 'ios' ? 36 : 24 },
          ]}
        >
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask Atlas anything…"
              placeholderTextColor={Atlas.paperFaint}
              value={inputText}
              onChangeText={setInputText}
              selectionColor={Atlas.amber}
              editable={!isTyping}
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={[styles.send, isTyping && { opacity: 0.5 }]} disabled={isTyping} activeOpacity={0.85}>
            <Send color={Atlas.inkOnAmber} size={18} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (inline) return <View style={styles.inlineContainer}>{Content}</View>;

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.container}>
      {Content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: { flex: 1, backgroundColor: Atlas.ink },
  container: { ...StyleSheet.absoluteFillObject, backgroundColor: Atlas.ink, zIndex: 100 },
  safeArea: { flex: 1 },
  header: {
    height: 64, paddingHorizontal: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: 1, borderBottomColor: Atlas.hairline,
  },
  headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandMark: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
  brandMarkText: { fontFamily: Fonts.serif, fontSize: 18, color: Atlas.inkOnAmber },
  headerTitle: { fontFamily: Fonts.serif, fontSize: 20, color: Atlas.paper, letterSpacing: -0.3 },
  headerStatus: { fontFamily: Fonts.sans, fontSize: 11, color: Atlas.green, marginTop: 2 },
  close: {
    width: 36, height: 36, borderRadius: Radii.r2,
    backgroundColor: Atlas.ink2,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Atlas.hairline,
  },
  chat: { flex: 1 },
  chatContent: { padding: 22, gap: 14 },
  bubble: { maxWidth: '85%', padding: 14, borderRadius: Radii.r3 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: Atlas.amber, borderBottomRightRadius: 4 },
  aiBubble: {
    alignSelf: 'flex-start', backgroundColor: Atlas.ink2,
    borderWidth: 1, borderColor: Atlas.hairline, borderBottomLeftRadius: 4,
  },
  msgText: { fontFamily: Fonts.sans, fontSize: 14.5, lineHeight: 22 },
  userText: { color: Atlas.inkOnAmber, fontWeight: '500' },
  aiText: { color: Atlas.paperDim },
  inputBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: Atlas.hairline,
    gap: 10, backgroundColor: Atlas.ink,
  },
  inputWrapper: {
    flex: 1, height: 48,
    backgroundColor: Atlas.ink2,
    borderRadius: Radii.r2, paddingHorizontal: 14,
    borderWidth: 1, borderColor: Atlas.hairline,
    justifyContent: 'center',
  },
  input: { fontFamily: Fonts.sans, color: Atlas.paper, fontSize: 14 } as any,
  send: {
    width: 48, height: 48, borderRadius: Radii.r2,
    backgroundColor: Atlas.amber,
    alignItems: 'center', justifyContent: 'center',
  },
});
