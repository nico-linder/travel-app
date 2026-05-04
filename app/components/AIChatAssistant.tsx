import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Send, Bot } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { chatWithAI } from '../lib/googleAI';
import { supabase } from '../lib/supabase';

export const AIChatAssistant = ({ 
  isOpen, 
  onClose, 
  tripId,
  tripName, 
  inline = false 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  tripId: string,
  tripName?: string,
  inline?: boolean
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
        
        // Fetch history
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true });
        
        if (data && data.length > 0) {
          setMessages(data.map(m => ({
            id: m.id,
            text: m.text,
            sender: m.sender as 'user' | 'ai'
          })));
        } else {
          // Welcome message
          setMessages([
            { id: 'welcome', text: `How can I help with your trip to ${tripName || 'your destination'}?`, sender: 'ai' }
          ]);
        }
      }
    };
    initChat();
  }, [tripId]);

  const handleSend = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // 1. Save user message to Supabase
      if (userId) {
        await supabase.from('chat_messages').insert({
          trip_id: tripId,
          user_id: userId,
          text: userMsg.text,
          sender: 'user'
        });
      }

      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.text }]
        }));

      const systemPrompt = tripName 
        ? `You are an expert travel planning assistant for a trip to ${tripName}. Be concise, professional, and helpful.`
        : undefined;

      const aiResponse = await chatWithAI(inputText, history, systemPrompt);
      
      const aiMsg = { 
        id: (Date.now() + 1).toString(), 
        text: aiResponse, 
        sender: 'ai' as const 
      };

      setMessages(prev => [...prev, aiMsg]);

      // 2. Save AI message to Supabase
      if (userId) {
        await supabase.from('chat_messages').insert({
          trip_id: tripId,
          user_id: userId,
          text: aiMsg.text,
          sender: 'ai'
        });
      }
    } catch (error: any) {
      let userMessage = "I'm sorry, I encountered an error. Please try again.";
      
      if (error.message?.includes('503') || error.message?.includes('high demand')) {
        userMessage = "I'm a bit overwhelmed with requests right now! Please try again in a moment. ✈️";
      } else if (error.message?.includes('429')) {
        userMessage = "We've sent too many requests. Let's take a short break and try again soon.";
      }

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: userMessage, 
        sender: 'ai' as const 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  const Content = (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={styles.botCircle}>
            <Bot color="#818cf8" size={20} />
          </View>
          <Text style={styles.headerTitle}>Travel AI</Text>
        </View>
        {!inline && (
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <X color="#64748b" size={20} />
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
              <Text style={[styles.msgText, msg.sender === 'user' ? styles.userText : styles.aiText]}>{msg.text}</Text>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.bubble, styles.aiBubble]}>
              <ActivityIndicator size="small" color="#818cf8" />
            </View>
          )}
        </ScrollView>

        <View style={[
          styles.inputBar, 
          { paddingBottom: inline ? (Platform.OS === 'ios' ? 90 : 80) : (Platform.OS === 'ios' ? 36 : 24) }
        ]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor="#475569"
              value={inputText}
              onChangeText={setInputText}
              selectionColor="#818cf8"
              editable={!isTyping}
            />
          </View>
          <TouchableOpacity onPress={handleSend} style={styles.send} disabled={isTyping}>
            <LinearGradient
              colors={['#818cf8', '#60a5fa']}
              style={[styles.sendInner, isTyping && { opacity: 0.5 }]}
            >
              <Send color="#ffffff" size={18} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (inline) {
    return <View style={styles.inlineContainer}>{Content}</View>;
  }

  return (
    <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.container}>
      {Content}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    zIndex: 100,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 72,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  botCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(129, 140, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.2)',
  },
  headerTitle: {
    color: '#ededed',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chat: {
    flex: 1,
  },
  chatContent: {
    padding: 24,
    gap: 24,
  },
  bubble: {
    maxWidth: '85%',
    padding: 18,
    borderRadius: 20,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#3b82f6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  msgText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  userText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#ededed',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 12,
    backgroundColor: '#0a0a0a',
  },
  inputWrapper: {
    flex: 1,
    height: 52,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
  },
  input: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    outlineStyle: 'none',
  } as any,
  send: {
    width: 52,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sendInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
