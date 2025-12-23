import { User, Message, UserProfile, ConsultantProfile, Recipe, Consultation, Billing } from '../types';

// --- IN-MEMORY MOCK DATABASE ---
// This replaces localStorage to simulate a backend database connection.
// Data will reset on page refresh.

let mockUsers: User[] = [
    // Seed with a default user, linked to the consultant
    { 
        id: '1', 
        name: 'John Doe',
        email: 'user@example.com', 
        role: 'user', 
        profile: { 
            age: '30', 
            medicalHistory: 'None', 
            foodAllergies: 'Peanuts', 
            height: '175 cm', 
            weight: '70 kg', 
            bloodType: 'O+',
            consultantId: '2' 
        } 
    },
    {
        id: '2',
        name: 'Dr. Anjali Sharma',
        email: 'consultant@example.com',
        role: 'consultant',
        consultantProfile: { qualifications: 'B.A.M.S.', specialization: 'Panchakarma', consultationFee: '50'}
    },
    // Add another patient for the consultant to see
    {
        id: '3',
        name: 'Jane Smith',
        email: 'patient.two@example.com',
        role: 'user',
        profile: { 
            age: '45', 
            medicalHistory: 'Diabetes Type 2', 
            foodAllergies: 'None',
            height: '160 cm',
            weight: '65 kg',
            bloodType: 'A-',
            consultantId: '2' 
        }
    }
];
let mockChats: Record<string, Message[]> = {};

let mockConsultations: Consultation[] = [
    { id: 'c1', patientId: '1', patientName: 'John Doe', date: '2024-07-15T10:00:00Z', notes: 'Discussed dietary changes for improving digestion.', status: 'Completed' },
    { id: 'c2', patientId: '3', patientName: 'Jane Smith', date: '2024-07-28T14:30:00Z', notes: 'Follow-up on diabetes management plan.', status: 'Scheduled' },
    { id: 'c3', patientId: '1', patientName: 'John Doe', date: '2024-06-20T09:00:00Z', notes: 'Initial consultation regarding skin allergies.', status: 'Completed' },
    { id: 'c4', patientId: '3', patientName: 'Jane Smith', date: '2024-06-10T11:00:00Z', notes: 'Cancelled by patient.', status: 'Cancelled' },
];

let mockBillings: Billing[] = [
    { id: 'b1', consultationId: 'c1', patientId: '1', patientName: 'John Doe', amount: 50, date: '2024-07-15T11:00:00Z', status: 'Paid' },
    { id: 'b2', consultationId: 'c3', patientId: '1', patientName: 'John Doe', amount: 50, date: '2024-06-20T10:00:00Z', status: 'Paid' },
    { id: 'b3', consultationId: 'c2', patientId: '3', patientName: 'Jane Smith', amount: 50, date: '2024-07-28T15:30:00Z', status: 'Pending' },
];


// --- MOCK API FUNCTIONS ---

const MOCK_PASSWORD = 'password123';

// --- User Authentication ---
export const login = (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (user && password === MOCK_PASSWORD) {
                resolve(user);
            } else {
                reject(new Error('Invalid email or password.'));
            }
        }, 500);
    });
};

export const signup = (email: string, password: string, name: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                reject(new Error('An account with this email already exists.'));
                return;
            }
            if (password !== MOCK_PASSWORD) { // Simple validation for mock
                reject(new Error('Password is not valid. Use "password123" for demo.'));
                return;
            }
            const newUser: User = {
                id: (Math.random() + 1).toString(36).substring(7),
                email,
                name,
                role: 'user',
                profile: {} // Empty profile, to be filled during onboarding
            };
            mockUsers.push(newUser);
            resolve(newUser);
        }, 500);
    });
};

export const consultantSignup = (email: string, password: string, name: string, profile: ConsultantProfile): Promise<User> => {
    return new Promise((resolve, reject) => {
         setTimeout(() => {
            const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (existingUser) {
                reject(new Error('An account with this email already exists.'));
                return;
            }
             const newConsultant: User = {
                id: (Math.random() + 1).toString(36).substring(7),
                email,
                name,
                role: 'consultant',
                consultantProfile: profile,
             };
             mockUsers.push(newConsultant);
             resolve(newConsultant);
         }, 500);
    });
};


// --- Profile Management ---
export const updateUserProfile = (userId: string, profile: UserProfile, name?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                if (name) {
                    mockUsers[userIndex].name = name;
                }
                mockUsers[userIndex].profile = { ...mockUsers[userIndex].profile, ...profile };
                resolve(mockUsers[userIndex]);
            } else {
                reject(new Error("User not found"));
            }
        }, 300);
    });
};

export const updateConsultantProfile = (userId: string, profile: ConsultantProfile, name?: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId && u.role === 'consultant');
            if (userIndex !== -1) {
                if (name) {
                    mockUsers[userIndex].name = name;
                }
                mockUsers[userIndex].consultantProfile = { ...mockUsers[userIndex].consultantProfile, ...profile };
                resolve(mockUsers[userIndex]);
            } else {
                reject(new Error("Consultant not found"));
            }
        }, 300);
    });
};

// --- Patient & Consultation Management for Consultants ---
export const getPatientsForConsultant = (consultantId: string): Promise<User[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const patients = mockUsers.filter(u => u.role === 'user' && u.profile?.consultantId === consultantId);
            resolve(patients);
        }, 500);
    });
};

export const getConsultationHistory = (consultantId: string): Promise<Consultation[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In a real app, you'd filter by consultantId. Here we assume all are for the one mock consultant.
            resolve(mockConsultations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, 700);
    });
};

export const getBillingHistory = (consultantId: string): Promise<Billing[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Same assumption as above.
            resolve(mockBillings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }, 800);
    });
};


// --- Chat History ---
export const getChatHistory = (userId: string): Promise<Message[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockChats[userId] || []);
        }, 300);
    });
};

export const saveMessage = (userId: string, message: Message): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!mockChats[userId]) {
                mockChats[userId] = [];
            }
            if (!mockChats[userId].some(m => m.id === message.id)) {
                 mockChats[userId].push(message);
            }
            resolve();
        }, 100);
    });
};

export const saveCompleteAIMessage = (userId: string, messageId: number, fullText: string, lang: string): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (mockChats[userId]) {
                const messageIndex = mockChats[userId].findIndex(m => m.id === messageId);
                if (messageIndex !== -1) {
                    mockChats[userId][messageIndex].text = fullText;
                    mockChats[userId][messageIndex].lang = lang; // Save the detected language
                    mockChats[userId][messageIndex].recipes = undefined; // Ensure no stale recipe data
                }
            }
            resolve();
        }, 100);
    });
}

export const saveRecipeMessage = (userId: string, messageId: number, recipes: Recipe[]): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (mockChats[userId]) {
                const messageIndex = mockChats[userId].findIndex(m => m.id === messageId);
                if (messageIndex !== -1) {
                    mockChats[userId][messageIndex].recipes = recipes;
                    mockChats[userId][messageIndex].text = undefined; // Ensure no stale text data
                }
            }
            resolve();
        }, 100);
    });
}


export const clearChatHistory = (userId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (mockChats[userId]) {
                mockChats[userId] = [];
            }
            resolve();
        }, 300);
    });
};