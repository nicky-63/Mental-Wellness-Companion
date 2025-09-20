import React from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, doc, setDoc, orderBy, serverTimestamp, deleteDoc } from 'firebase/firestore';

// --- IMPORTANT: PASTE YOUR FIREBASE CONFIG HERE ---
// Replace this entire object with the one you got from Firebase
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
  measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE"
};
// --- END OF CONFIGURATION ---

// --- Static Data ---
const resources = [
  {
    title: 'Kids Help Phone',
    description: 'A 24/7 national support service for Canadian youth. They offer professional counselling, information, referrals, and volunteer-led, text-based support.',
    link: 'https://kidshelpphone.ca/',
  },
  {
    title: 'The Trevor Project',
    description: 'The leading national organization providing crisis intervention and suicide prevention services to lesbian, gay, bisexual, transgender, queer & questioning (LGBTQ) young people under 25.',
    link: 'https://www.thetrevorproject.org/',
  },
  {
    title: 'NAMI (National Alliance on Mental Illness)',
    description: 'A U.S.-based advocacy group, NAMI is the nation\'s largest grassroots mental health organization dedicated to building better lives for the millions of Americans affected by mental illness.',
    link: 'https://www.nami.org/',
  },
  {
    title: 'Child Mind Institute',
    description: 'An independent, national nonprofit dedicated to transforming the lives of children and families struggling with mental health and learning disorders.',
    link: 'https://childmind.org/',
  },
];

const techniques = [
    {
    title: 'Box Breathing Visualizer',
    description: 'A technique to calm your nervous system. It involves breathing in, holding your breath, breathing out, and holding your breath again, each for a count of four. Use the visualizer below to guide you.',
    component: 'BreathingVisualizer',
  },
  {
    title: '5-4-3-2-1 Grounding Technique',
    description: 'A simple but powerful technique to calm yourself down when you feel overwhelmed. Name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.',
    steps: [
      'Acknowledge 5 things you see around you.',
      'Acknowledge 4 things you can touch around you.',
      'Acknowledge 3 things you can hear.',
      'Acknowledge 2 things you can smell.',
      'Acknowledge 1 thing you can taste.',
    ],
  },
  {
    title: 'Mindful Observation',
    description: 'Pick a natural object from your immediate environment and observe it for a minute or more. Just notice it without judging it. This helps you to be present.',
    steps: [
        'Choose a small, natural object (a flower, a stone, a leaf).',
        'Hold it or rest your gaze on it.',
        'Observe its colors, texture, shape, and smell.',
        'Notice every detail without judging or naming.',
        'If your mind wanders, gently bring it back to the object.'
    ]
  },
];

// --- Helper Functions & Hooks ---
const useFirebase = () => {
    const [auth, setAuth] = React.useState(null);
    const [db, setDb] = React.useState(null);
    const [userId, setUserId] = React.useState(null);
    const [isAuthReady, setIsAuthReady] = React.useState(false);
    
    React.useEffect(() => {
        try {
            // Check if the user has replaced the placeholder API keys
            if (firebaseConfig.apiKey.includes("PASTE_YOUR_API_KEY_HERE")) {
                console.error("FIREBASE CONFIGURATION ERROR: Please replace the placeholder values in the 'firebaseConfig' object at the top of src/App.jsx with your actual keys from your Firebase project console.");
                // Prevent the app from trying to initialize Firebase with invalid keys
                setIsAuthReady(false); // Keep the app in a "connecting" state
                return;
            }

            // We now use the config object directly from the code above
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            setAuth(authInstance);
            setDb(dbInstance);

            const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
                if (user) {
                    setUserId(user.uid);
                } else {
                     try {
                        // For this hackathon version, we'll just sign in anonymously
                        await signInAnonymously(authInstance);
                    } catch (error) {
                        console.error("Error signing in:", error);
                    }
                }
                setIsAuthReady(true);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
        }
    }, []);

    return { auth, db, userId, isAuthReady };
};


// --- UI Components ---
const MessageSquare = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>);
const Smile = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>);
const Book = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>);
const HeartHandshake = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08v0c.82.82 2.13.82 2.94 0l.06-.06L12 11l2.96-2.96a2.17 2.17 0 0 0 0-3.08v0c-.82-.82-2.13-.82-2.94 0l-.06.06L12 5Z"></path></svg>);
const Send = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>);
const Bot = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>);
const User = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const Sparkles = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>);

const moods = {
  happy: { emoji: '😊', label: 'Happy', color: 'bg-green-100 text-green-800' },
  calm: { emoji: '😌', label: 'Calm', color: 'bg-blue-100 text-blue-800' },
  sad: { emoji: '😢', label: 'Sad', color: 'bg-indigo-100 text-indigo-800' },
  anxious: { emoji: '😟', label: 'Anxious', color: 'bg-yellow-100 text-yellow-800' },
  angry: { emoji: '😠', label: 'Angry', color: 'bg-red-100 text-red-800' },
};

// --- App Components ---

const Chatbot = ({ db, userId, isAuthReady }) => {
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const messagesEndRef = React.useRef(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    React.useEffect(() => {
        setMessages([{ role: 'model', text: "Hello! I'm Kai, your personal AI companion. I'm here to listen, offer support, and help you navigate your feelings. How are you doing today?" }]);
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', text: input };
        const currentInput = input; // Capture input before clearing
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const systemPrompt = `You are Kai, a friendly, kind, empathetic, and understanding AI companion for youth mental health. Your primary goal is to provide a safe, non-judgmental space for young people to express their feelings.
- Your tone should always be gentle, supportive, and encouraging.
- Use simple, clear language. Avoid clinical jargon.
- Validate their feelings. Use phrases like "That sounds really tough," "It's completely okay to feel that way," or "Thank you for sharing that with me."
- Never give medical advice, diagnoses, or tell the user what to do. You are not a therapist.
- You can suggest helpful coping strategies like breathing exercises, grounding techniques, or journaling, but frame them as gentle suggestions, not commands.
- If a user expresses thoughts of self-harm or harming others, respond with care and immediately provide a crisis helpline number. Say this exactly: "It sounds like you're going through a lot of pain right now, and it's brave of you to talk about it. It's really important to talk to someone who can help keep you safe. You can connect with people who can support you by calling or texting 988 in the US and Canada, or calling 111 in the UK, anytime. Please reach out to them or a trusted adult."
- Keep your responses concise and easy to read. Use short paragraphs.
- End your messages with a gentle, open-ended question to encourage them to continue the conversation.`;
            
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: currentInput }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };
            
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const botMessageText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to respond to that.";
            setMessages(prev => [...prev, { role: 'model', text: botMessageText }]);

        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting right now. Please try again in a moment." }]);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50"><h2 className="text-xl font-bold text-gray-800">Chat with Kai</h2><p className="text-sm text-gray-500">Your friendly AI companion</p></div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                        {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Bot className="w-5 h-5"/></div>}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}><p className="text-sm whitespace-pre-wrap">{msg.text}</p></div>
                         {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"><User className="w-5 h-5"/></div>}
                    </div>
                ))}
                {loading && (
                     <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Bot className="w-5 h-5"/></div>
                        <div className="p-3 rounded-2xl bg-gray-200"><div className="flex items-center space-x-1"><span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span><span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150"></span><span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-300"></span></div></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center space-x-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type your message here..." className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 transition" disabled={loading}/>
                    <button onClick={sendMessage} disabled={loading} className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 disabled:bg-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"><Send className="w-5 h-5" /></button>
                </div>
            </div>
        </div>
    );
};

const MoodLog = ({ db, userId, isAuthReady }) => {
    const [moodData, setMoodData] = React.useState({});
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const appId = "mental-wellness-hackathon"; // A simple identifier

    React.useEffect(() => {
        if (isAuthReady && db && userId) {
            const path = `artifacts/${appId}/users/${userId}/moods`;
            const q = query(collection(db, path));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const data = {};
                querySnapshot.forEach((doc) => { data[doc.id] = doc.data(); });
                setMoodData(data);
            });
            return () => unsubscribe();
        }
    }, [db, userId, isAuthReady, appId]);

    const handleMoodSelect = async (mood) => {
        if (!isAuthReady || !db || !userId) return;
        const dateString = selectedDate.toISOString().split('T')[0];
        const docRef = doc(db, `artifacts/${appId}/users/${userId}/moods`, dateString);
        await setDoc(docRef, { mood: mood, timestamp: serverTimestamp() });
    };

    const renderCalendar = () => {
        const year = selectedDate.getFullYear();
        const month = selectedDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = Array.from({ length: firstDay }, (_, i) => <div key={`empty-start-${i}`} className="p-1"></div>);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const moodEntry = moodData[dateString];
            const isSelected = selectedDate.toDateString() === date.toDateString();

            days.push(
                <div key={day} onClick={() => setSelectedDate(date)} className={`p-1 text-center cursor-pointer border-2 rounded-lg transition-colors ${isSelected ? 'border-indigo-500' : 'border-transparent'}`}>
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full mx-auto ${moodEntry ? moods[moodEntry.mood].color : 'bg-gray-100'}`}>
                        {moodEntry ? moods[moodEntry.mood].emoji : day}
                    </span>
                </div>
            );
        }
        return days;
    };
    
    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg h-full overflow-y-auto">
             <h2 className="text-2xl font-bold text-gray-800 mb-2">Mood Log</h2><p className="text-gray-500 mb-6">Track your feelings one day at a time.</p>
             <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="px-2 py-1 rounded-md hover:bg-gray-200">&lt;</button>
                    <h3 className="font-semibold text-lg">{selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                    <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="px-2 py-1 rounded-md hover:bg-gray-200">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm text-center text-gray-500 mb-2"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>
                <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
             </div>
             <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">How are you feeling on {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}?</h3>
                <div className="flex flex-wrap gap-3">
                    {Object.keys(moods).map(moodKey => (<button key={moodKey} onClick={() => handleMoodSelect(moodKey)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform transform hover:scale-105 ${moods[moodKey].color}`}><span>{moods[moodKey].emoji}</span><span>{moods[moodKey].label}</span></button>))}
                </div>
             </div>
        </div>
    );
};

const DeleteConfirmationModal = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800">Delete Entry?</h3>
            <p className="text-gray-600 mt-2">Are you sure? This action cannot be undone.</p>
            <div className="flex justify-end gap-4 mt-6">
                <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition">Cancel</button>
                <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition">Delete</button>
            </div>
        </div>
    </div>
);

const Journal = ({ db, userId, isAuthReady }) => {
    const [entries, setEntries] = React.useState([]);
    const [currentEntry, setCurrentEntry] = React.useState('');
    const [selectedEntry, setSelectedEntry] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const [entryToDelete, setEntryToDelete] = React.useState(null);
    const [analysis, setAnalysis] = React.useState('');
    const [isAnalyzing, setIsAnalyzing] = React.useState(false);
    const appId = "mental-wellness-hackathon"; // A simple identifier

    React.useEffect(() => {
        if (isAuthReady && db && userId) {
            const path = `artifacts/${appId}/users/${userId}/journal`;
            const q = query(collection(db, path), orderBy('timestamp', 'desc'));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                setIsLoading(false);
            }, (error) => { console.error(error); setIsLoading(false); });
            return () => unsubscribe();
        } else { setIsLoading(false); }
    }, [db, userId, isAuthReady, appId]);

    const handleSave = async () => {
        if (!currentEntry.trim() || !isAuthReady || !db || !userId) return;
        const path = `artifacts/${appId}/users/${userId}/journal`;
        try {
            if (selectedEntry) {
                 await setDoc(doc(db, path, selectedEntry.id), { text: currentEntry, timestamp: selectedEntry.timestamp, lastEdited: serverTimestamp() });
            } else {
                 await addDoc(collection(db, path), { text: currentEntry, timestamp: serverTimestamp() });
            }
            setCurrentEntry(''); setSelectedEntry(null);
        } catch(error) { console.error("Error saving entry:", error); }
    };
    
    const handleDeleteClick = (id) => { setEntryToDelete(id); setIsDeleteModalOpen(true); };
    const confirmDelete = async () => {
        if (!entryToDelete || !isAuthReady || !db || !userId) return;
        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/journal`, entryToDelete));
            if (selectedEntry && selectedEntry.id === entryToDelete) { setCurrentEntry(''); setSelectedEntry(null); }
        } catch(error) { console.error("Error deleting entry:", error); }
        finally { setIsDeleteModalOpen(false); setEntryToDelete(null); }
    };

    const analyzeJournal = async () => {
        if (entries.length < 3) {
            setAnalysis("You need at least 3 journal entries for a helpful analysis. Keep writing!");
            return;
        }
        setIsAnalyzing(true);
        setAnalysis('');
        try {
            const journalContent = entries.map(e => `Date: ${e.timestamp?.toDate().toLocaleDateString()}\nEntry: ${e.text}`).join('\n\n---\n\n');
            const systemPrompt = `You are an AI assistant named Kai, specializing in gentle, supportive reflection. Analyze the following journal entries from a young person.
- Your goal is to provide a kind, encouraging, and non-judgmental summary. Do not give medical advice or diagnose any conditions.
- Identify 2-3 recurring themes or emotions.
- Highlight 1-2 moments of strength, positivity, or resilience you noticed.
- Frame your response in a gentle, second-person perspective (e.g., "I noticed you often write about...").
- Keep the tone warm and encouraging. Format the output with markdown for readability (e.g., use headings and bullet points).`;

            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const payload = {
                contents: [{ parts: [{ text: `Here are my journal entries:\n\n${journalContent}` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
            };
            
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate an analysis right now. Please try again later.";
            setAnalysis(analysisText);
        } catch (error) {
            console.error("Error analyzing journal:", error);
            setAnalysis("Sorry, I had trouble analyzing your journal. Please check your connection and try again.");
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <div className="p-6 bg-white rounded-2xl shadow-lg h-full flex flex-col md:flex-row gap-6 overflow-hidden">
            {isDeleteModalOpen && <DeleteConfirmationModal onConfirm={confirmDelete} onCancel={() => setIsDeleteModalOpen(false)} />}
            <div className="w-full md:w-1/3 flex flex-col">
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">Journal</h2><p className="text-gray-500 mb-4">A safe space for your thoughts.</p>
                 <button onClick={() => { setSelectedEntry(null); setCurrentEntry(''); }} className="w-full mb-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">+ New Entry</button>
                 <button onClick={analyzeJournal} disabled={isAnalyzing || entries.length < 3} className="w-full mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:bg-purple-300 flex items-center justify-center gap-2">
                     <Sparkles className="w-5 h-5" /> {isAnalyzing ? 'Analyzing...' : 'Get AI Reflection'}
                 </button>
                 <div className="flex-1 overflow-y-auto border-t border-gray-200 pt-4">
                    {isLoading ? <p>Loading entries...</p> : entries.length > 0 ? (
                        <ul className="space-y-2 pr-2">{entries.map(entry => (<li key={entry.id} onClick={() => { setSelectedEntry(entry); setCurrentEntry(entry.text); setAnalysis(''); }} className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedEntry?.id === entry.id ? 'bg-indigo-100' : 'hover:bg-gray-100'}`}><p className="text-sm text-gray-600 truncate">{entry.text}</p><p className="text-xs text-gray-400 mt-1">{entry.timestamp?.toDate().toLocaleDateString()}</p></li>))}</ul>
                     ) : <p className="text-sm text-gray-500">No entries yet. Start writing!</p>}
                 </div>
            </div>
            <div className="w-full md:w-2/3 flex flex-col border-l border-gray-200 pl-6">
                {analysis ? (
                    <div className="prose prose-sm h-full overflow-y-auto">
                        <h3 className="font-bold text-lg mb-2">Your AI Reflection</h3>
                        <div dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
                    </div>
                ) : (
                    <>
                        <textarea value={currentEntry} onChange={(e) => setCurrentEntry(e.target.value)} placeholder="Write what's on your mind... Your thoughts are safe here." className="w-full h-full p-4 border border-gray-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"></textarea>
                        <div className="flex items-center mt-4">
                            <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">{selectedEntry ? 'Update Entry' : 'Save Entry'}</button>
                            {selectedEntry && <button onClick={() => handleDeleteClick(selectedEntry.id)} className="ml-auto px-4 py-2 text-sm text-red-500 hover:bg-red-100 rounded-lg">Delete</button>}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const BreathingVisualizer = () => {
    const [mode, setMode] = React.useState('ready'); // ready, running, paused
    const [text, setText] = React.useState('Click to Start');
    const animationTimeoutRef = React.useRef(null);

    const cycle = () => {
        setText('Breathe In');
        animationTimeoutRef.current = setTimeout(() => setText('Hold'), 4000);
        animationTimeoutRef.current = setTimeout(() => setText('Breathe Out'), 8000);
        animationTimeoutRef.current = setTimeout(() => setText('Hold'), 12000);
        animationTimeoutRef.current = setTimeout(cycle, 16000);
    };

    const handleClick = () => {
        if (mode === 'running') {
            clearTimeout(animationTimeoutRef.current);
            setMode('paused');
            setText('Paused');
        } else {
            setMode('running');
            cycle();
        }
    };

    const animationClass = mode === 'running' ? 'animate-box-breathing' : '';

    return (
        <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-indigo-50 text-center">
            <style>{`
                @keyframes box-breathing {
                    0%, 100% { transform: scale(0.5); background-color: #a5b4fc; } /* Inhale Start / Cycle End */
                    25% { transform: scale(1); background-color: #818cf8; } /* Inhale End / Hold Start */
                    50% { transform: scale(1); background-color: #818cf8; } /* Hold End / Exhale Start */
                    75% { transform: scale(0.5); background-color: #a5b4fc; } /* Exhale End / Hold Empty Start */
                }
                .animate-box-breathing {
                    animation: box-breathing 16s infinite ease-in-out;
                }
            `}</style>
            <div onClick={handleClick} className="w-40 h-40 cursor-pointer rounded-lg bg-indigo-300 flex items-center justify-center transition-all duration-500" style={{ transform: mode !== 'running' ? 'scale(0.75)' : '' }}>
                <div className={`w-full h-full rounded-lg flex items-center justify-center ${animationClass}`}>
                    <span className="text-white font-semibold text-lg">{text}</span>
                </div>
            </div>
        </div>
    );
};

const Resources = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Helpful Resources & Techniques</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-indigo-200 pb-2">Coping Techniques</h3>
        <div className="space-y-4">
          {techniques.map((tech) => (
            <div key={tech.title} className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-indigo-700">{tech.title}</h4>
              <p className="text-gray-600 mt-1 mb-3">{tech.description}</p>
              {tech.component === 'BreathingVisualizer' && <BreathingVisualizer />}
              {tech.steps && <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">{tech.steps.map((step, i) => <li key={i}>{step}</li>)}</ul>}
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-green-200 pb-2">Helpful Websites</h3>
        <div className="space-y-4">
          {resources.map((res) => (<div key={res.title} className="p-4 bg-gray-50 rounded-lg"><h4 className="font-bold text-green-700">{res.title}</h4><p className="text-gray-600 my-1">{res.description}</p><a href={res.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">Visit Website &rarr;</a></div>))}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
    const [activeTab, setActiveTab] = React.useState('chat');
    const { auth, db, userId, isAuthReady } = useFirebase();
    const navItems = [{ id: 'chat', label: 'Chat', icon: MessageSquare }, { id: 'mood', label: 'Mood Log', icon: Smile }, { id: 'journal', label: 'Journal', icon: Book }, { id: 'resources', label: 'Resources', icon: HeartHandshake }];

    const renderContent = () => {
        if (!isAuthReady) {
            return (
                <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-lg">
                    <div className="text-center p-8">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Connecting...</h2>
                        <p className="text-gray-500">
                            If this is taking a while, please check the developer console for a `FIREBASE CONFIGURATION ERROR` message.
                        </p>
                    </div>
                </div>
            );
        }
        switch (activeTab) {
            case 'chat': return <Chatbot db={db} userId={userId} isAuthReady={isAuthReady} />;
            case 'mood': return <MoodLog db={db} userId={userId} isAuthReady={isAuthReady} />;
            case 'journal': return <Journal db={db} userId={userId} isAuthReady={isAuthReady} />;
            case 'resources': return <Resources />;
            default: return <Chatbot db={db} userId={userId} isAuthReady={isAuthReady} />;
        }
    };
    
    return (
        <div className="bg-gray-100 font-sans w-screen h-screen flex flex-col antialiased">
           <header className="p-4 bg-white border-b border-gray-200"><div className="max-w-6xl mx-auto flex items-center"><HeartHandshake className="w-8 h-8 text-indigo-500 mr-3" /><h1 className="text-2xl font-bold text-gray-800">Mental Wellness Companion</h1></div></header>
            <div className="flex-1 flex max-w-6xl w-full mx-auto p-4 gap-4 overflow-hidden">
                <nav className="w-20 md:w-56 bg-white rounded-2xl shadow-lg p-4 flex flex-col">
                    {navItems.map(item => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center p-3 my-1 w-full text-left rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}><item.icon className="w-6 h-6" /><span className="ml-4 hidden md:inline">{item.label}</span></button>))}
                </nav>
                <main className="flex-1">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}




