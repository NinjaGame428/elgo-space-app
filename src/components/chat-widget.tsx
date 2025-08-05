
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User, Conversation, Message } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { format } from 'date-fns';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    
    const supabase = createClient();
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchUserAndConversation = async () => {
            const userEmail = localStorage.getItem('userEmail');
            if (!userEmail) {
                setIsLoading(false);
                return;
            };

            // 1. Fetch user data
            const userRes = await fetch(`/api/users?email=${userEmail}`);
            const users: User[] = await userRes.json();
            if (users.length > 0) {
                const currentUser = users[0];
                setUser(currentUser);

                // 2. Fetch or create conversation
                const convoRes = await fetch(`/api/chat/conversations?userId=${currentUser.id}`);
                let convos: Conversation[] = await convoRes.json();

                if (convos.length > 0) {
                    setConversation(convos[0]);
                } else {
                    const createRes = await fetch('/api/chat/conversations', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: currentUser.id }),
                    });
                    const newConvo = await createRes.json();
                    setConversation(newConvo);
                }
            }
            setIsLoading(false);
        };
        fetchUserAndConversation();
    }, []);

    useEffect(() => {
        if (!conversation) return;

        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/chat/messages?conversationId=${conversation.id}`);
                if (!res.ok) {
                    setMessages([]); // Set to empty array on error
                    return;
                }
                const data = await res.json();
                // Ensure data is an array before setting state
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    setMessages([]);
                }
            } catch (error) {
                console.error("Failed to fetch messages:", error);
                setMessages([]);
            }
        };
        fetchMessages();

        // Listen for new messages
        const channel = supabase
            .channel(`chat:${conversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${conversation.id}`
            }, (payload) => {
                setMessages(currentMessages => [...currentMessages, payload.new as Message]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [conversation, supabase]);
    
     useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !conversation) return;

        const content = newMessage;
        setNewMessage('');

        await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: conversation.id,
                senderId: user.id,
                content: content,
            }),
        });
    };
    
    // Don't render the widget if not logged in or loading
    if (isLoading || !user) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={cn("transition-all duration-300", isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none translate-y-4')}>
                <Card className="w-80 h-[500px] flex flex-col shadow-2xl">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                        <CardTitle className="text-lg">Support Chat</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 overflow-hidden">
                       <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                            <div className="space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={index} className={cn("flex items-end gap-2", msg.sender_id === user.id ? 'justify-end' : 'justify-start')}>
                                        {msg.sender_id !== user.id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>A</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-[75%] rounded-lg px-3 py-2 text-sm", msg.sender_id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p>{msg.content}</p>
                                            <p className="text-xs text-right mt-1 opacity-70">{format(new Date(msg.created_at), 'p')}</p>
                                        </div>
                                         {msg.sender_id === user.id && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 border-t">
                        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="h-5 w-5" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
            <Button
                size="icon"
                className={cn("rounded-full w-16 h-16 shadow-lg transition-all duration-300", isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100')}
                onClick={() => setIsOpen(true)}
            >
                <MessageSquare className="h-8 w-8" />
            </Button>
        </div>
    );
}
