import { useState, useEffect, useCallback } from 'react';

export type SupportCategory = 'Booking' | 'Payment' | 'Safety' | 'Account';
export type SupportChannel = 'CHAT' | 'CALLBACK' | 'WHATSAPP';
export type TicketStatus = 'OPEN' | 'AGENT_ASSIGNED' | 'RESOLVED';

export interface SupportAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  totalResolved: number;
  specialization: SupportCategory;
  isOnline: boolean;
  averageResponseMinutes: number;
  badge: string;
}

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isOfficial?: boolean;
}

export interface SupportContextData {
  activeBookingId?: string;
  serviceCategory?: string;
  problemType?: string;
  bookingState?: string;
  recentTransactionId?: string;
  transactionAmount?: number;
  transactionStatus?: string;
  accountStatus?: string;
  societyName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export interface CallbackRequestDetails {
  preferredSlot: string;
  phoneNumber: string;
  scheduledDate: string;
  notes?: string;
  assignedAgentName?: string;
}

export interface SupportTicket {
  ticketId: string;
  userId: string;
  userName: string;
  userPhone?: string;
  category: SupportCategory;
  channel: SupportChannel;
  status: TicketStatus;
  createdAt: string;
  subject: string;
  description: string;
  assignedAgent?: SupportAgent;
  contextData: SupportContextData;
  chatMessages: SupportChatMessage[];
  callbackDetails?: CallbackRequestDetails;
  resolvedAt?: string;
  resolutionNotes?: string;
}

export const HUMAN_SUPPORT_AGENTS: SupportAgent[] = [
  {
    id: 'agent_priya',
    name: 'Priya Sharma',
    role: 'Senior Customer Advocate',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    rating: 4.98,
    totalResolved: 1420,
    specialization: 'Booking',
    isOnline: true,
    averageResponseMinutes: 1.5,
    badge: 'Lead Specialist',
  },
  {
    id: 'agent_rahul',
    name: 'Rahul Mehta',
    role: 'Billing & Payments Officer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    rating: 4.94,
    totalResolved: 980,
    specialization: 'Payment',
    isOnline: true,
    averageResponseMinutes: 2,
    badge: 'Escalation Desk',
  },
  {
    id: 'agent_anita',
    name: 'Anita Roy',
    role: 'Safety & Member Care Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    rating: 5.0,
    totalResolved: 2150,
    specialization: 'Safety',
    isOnline: true,
    averageResponseMinutes: 1,
    badge: 'Priority Response',
  },
  {
    id: 'agent_vikram',
    name: 'Vikram Deshmukh',
    role: 'Cooperative Operations Manager',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    rating: 4.92,
    totalResolved: 1650,
    specialization: 'Account',
    isOnline: true,
    averageResponseMinutes: 2.5,
    badge: 'Co-op Liaison',
  },
];

const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    ticketId: 'TKT-849201',
    userId: 'u_aarav',
    userName: 'Aarav Patel',
    userPhone: '+91 98201 23456',
    category: 'Booking',
    channel: 'CHAT',
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    resolvedAt: new Date(Date.now() - 3600 * 1000 * 46).toISOString(),
    subject: 'Reschedule request for Plumbing service',
    description: 'Needed to adjust worker arrival slot by 30 mins.',
    assignedAgent: HUMAN_SUPPORT_AGENTS[0],
    contextData: {
      activeBookingId: 'b_past_01',
      serviceCategory: 'Plumbing',
      problemType: 'Pipe Leakage',
      bookingState: 'COMPLETED',
      societyName: 'Palm Meadows Cooperative',
      accountStatus: 'Verified Resident',
    },
    chatMessages: [
      {
        id: 'msg_01',
        sender: 'user',
        senderName: 'Aarav Patel',
        text: 'Hi Priya, can I request the plumber to come at 3:30 PM instead of 3:00 PM?',
        timestamp: new Date(Date.now() - 3600 * 1000 * 48).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'msg_02',
        sender: 'agent',
        senderName: 'Priya Sharma',
        text: 'Hello Aarav! Absolutely. I have reached out directly to Rajesh Kumar (your assigned plumber) and updated his schedule to 3:30 PM. He has confirmed!',
        timestamp: new Date(Date.now() - 3600 * 1000 * 47).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOfficial: true,
      },
      {
        id: 'msg_03',
        sender: 'user',
        senderName: 'Aarav Patel',
        text: 'Thank you so much! Really appreciate the quick human assistance.',
        timestamp: new Date(Date.now() - 3600 * 1000 * 46).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    resolutionNotes: 'Worker schedule adjusted and mutually confirmed.',
  },
];

const STORAGE_KEY = 'cooperative_human_support_store_v1';

export interface CreateTicketParams {
  userId: string;
  userName: string;
  userPhone?: string;
  category: SupportCategory;
  channel: SupportChannel;
  subject?: string;
  description: string;
  contextData: SupportContextData;
  initialUserMessage?: string;
  preferredCallbackSlot?: string;
}

export function useSupportStore() {
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_SUPPORT_TICKETS;
  });

  const [activeTicketId, setActiveTicketId] = useState<string | null>(() => {
    return null;
  });

  // Save to localStorage whenever tickets change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    } catch {
      // Ignore storage errors
    }
  }, [tickets]);

  // Select optimal agent based on category
  const selectAgentForCategory = useCallback((category: SupportCategory): SupportAgent => {
    const matchingAgent = HUMAN_SUPPORT_AGENTS.find((a) => a.specialization === category && a.isOnline);
    return matchingAgent || HUMAN_SUPPORT_AGENTS[0];
  }, []);

  // Create a new support ticket
  const createTicket = useCallback((params: CreateTicketParams): SupportTicket => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `TKT-${randomNum}`;
    const agent = selectAgentForCategory(params.category);
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const initialMessages: SupportChatMessage[] = [];

    // System welcome message
    initialMessages.push({
      id: `sys_${Date.now()}`,
      sender: 'system',
      senderName: 'Cooperative Support Desk',
      text: `Connected with ${agent.name} (${agent.role}). All context and IDs have been auto-attached.`,
      timestamp: formattedTime,
    });

    // If user provided a message, add it
    if (params.initialUserMessage || params.description) {
      initialMessages.push({
        id: `usr_${Date.now() + 1}`,
        sender: 'user',
        senderName: params.userName,
        text: params.initialUserMessage || params.description,
        timestamp: formattedTime,
      });

      // Human agent immediate acknowledgment
      setTimeout(() => {
        setTickets((prev) =>
          prev.map((t) => {
            if (t.ticketId !== ticketId) return t;
            const autoReply: SupportChatMessage = {
              id: `agt_${Date.now()}`,
              sender: 'agent',
              senderName: agent.name,
              text: `Hello ${params.userName}! I am ${agent.name} from the member support team. I have your details (Booking ${params.contextData.activeBookingId || 'referenced'} / Society ${params.contextData.societyName || 'on file'}). Looking into this right now!`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOfficial: true,
            };
            return {
              ...t,
              chatMessages: [...t.chatMessages, autoReply],
            };
          })
        );
      }, 1200);
    }

    const callbackDetails: CallbackRequestDetails | undefined =
      params.channel === 'CALLBACK'
        ? {
            preferredSlot: params.preferredCallbackSlot || 'Within 15 minutes',
            phoneNumber: params.userPhone || '+91 98201 23456',
            scheduledDate: 'Today',
            notes: params.description,
            assignedAgentName: agent.name,
          }
        : undefined;

    const newTicket: SupportTicket = {
      ticketId,
      userId: params.userId,
      userName: params.userName,
      userPhone: params.userPhone,
      category: params.category,
      channel: params.channel,
      status: 'AGENT_ASSIGNED',
      createdAt: now.toISOString(),
      subject: params.subject || `${params.category} Support Inquiry`,
      description: params.description,
      assignedAgent: agent,
      contextData: params.contextData,
      chatMessages: initialMessages,
      callbackDetails,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setActiveTicketId(ticketId);
    return newTicket;
  }, [selectAgentForCategory]);

  // Send a chat message within a ticket
  const sendChatMessage = useCallback((ticketId: string, text: string, sender: 'user' | 'agent' = 'user') => {
    if (!text.trim()) return;
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        const senderName = sender === 'user' ? ticket.userName : (ticket.assignedAgent?.name || 'Support Agent');
        const newMsg: SupportChatMessage = {
          id: `msg_${Date.now()}`,
          sender,
          senderName,
          text: text.trim(),
          timestamp: formattedTime,
          isOfficial: sender === 'agent',
        };
        return {
          ...ticket,
          chatMessages: [...ticket.chatMessages, newMsg],
        };
      })
    );

    // If user sent a message, simulate agent reading and replying naturally
    if (sender === 'user') {
      setTimeout(() => {
        setTickets((prev) =>
          prev.map((ticket) => {
            if (ticket.ticketId !== ticketId || ticket.status === 'RESOLVED') return ticket;
            const agent = ticket.assignedAgent || HUMAN_SUPPORT_AGENTS[0];
            
            let agentReply = `Understood. I have flagged this on our cooperative dashboard and am coordinating directly with the team.`;
            const lowerText = text.toLowerCase();
            
            if (lowerText.includes('refund') || lowerText.includes('payment') || lowerText.includes('money') || lowerText.includes('charge')) {
              agentReply = `I have verified Transaction #${ticket.contextData.recentTransactionId || 'TX-90281'}. The cooperative escrow ledger confirms your account details. Processing your request immediately.`;
            } else if (lowerText.includes('late') || lowerText.includes('arrive') || lowerText.includes('where') || lowerText.includes('worker')) {
              agentReply = `I checked the live GPS status for Booking #${ticket.contextData.activeBookingId || 'BK-8291'}. The assigned professional is currently en route. I will stay on this line until they arrive.`;
            } else if (lowerText.includes('thank') || lowerText.includes('thanks') || lowerText.includes('ok')) {
              agentReply = `You're very welcome! Is there anything else I can assist you with today?`;
            }

            const agentMsg: SupportChatMessage = {
              id: `agt_${Date.now()}`,
              sender: 'agent',
              senderName: agent.name,
              text: agentReply,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOfficial: true,
            };
            return {
              ...ticket,
              chatMessages: [...ticket.chatMessages, agentMsg],
            };
          })
        );
      }, 1500);
    }
  }, []);

  // Mark ticket as resolved
  const resolveTicket = useCallback((ticketId: string, notes?: string) => {
    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.ticketId !== ticketId) return ticket;
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const systemCloseMsg: SupportChatMessage = {
          id: `sys_close_${Date.now()}`,
          sender: 'system',
          senderName: 'Cooperative Support Desk',
          text: `Ticket #${ticketId} marked as RESOLVED by ${ticket.assignedAgent?.name || 'Agent'}. Thank you for using Cooperative Human Support.`,
          timestamp: formattedTime,
        };
        return {
          ...ticket,
          status: 'RESOLVED',
          resolvedAt: now.toISOString(),
          resolutionNotes: notes || 'Resolved via direct human support interaction.',
          chatMessages: [...ticket.chatMessages, systemCloseMsg],
        };
      })
    );
  }, []);

  // Generate WhatsApp Direct URL
  const generateWhatsAppLink = useCallback(
    (context: SupportContextData, category: SupportCategory, customNote?: string): string => {
      const phoneNumber = '919876543210'; // Official Cooperative Support WhatsApp Line
      const lines = [
        `*Cooperative Platform Human Support Request*`,
        `👤 *Member:* ${context.customerName || 'Resident Member'} (${context.customerPhone || 'N/A'})`,
        `🏢 *Society:* ${context.societyName || 'Palm Meadows'} · ${context.accountStatus || 'Verified'}`,
        `📂 *Category:* ${category}`,
        context.activeBookingId ? `📌 *Active Booking ID:* ${context.activeBookingId} (${context.serviceCategory || ''} - ${context.problemType || ''})` : '',
        context.recentTransactionId ? `💳 *Recent Transaction:* ${context.recentTransactionId} (₹${context.transactionAmount || '450'})` : '',
        customNote ? `\n📝 *Issue Summary:* ${customNote}` : '',
        `\n_Bypassing bot. Requesting human agent connection._`,
      ].filter(Boolean);

      const encodedText = encodeURIComponent(lines.join('\n'));
      return `https://wa.me/${phoneNumber}?text=${encodedText}`;
    },
    []
  );

  return {
    tickets,
    activeTicketId,
    setActiveTicketId,
    createTicket,
    sendChatMessage,
    resolveTicket,
    generateWhatsAppLink,
    agents: HUMAN_SUPPORT_AGENTS,
  };
}
