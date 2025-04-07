// Chatbot Functionality
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Sample financial tips
const financialTips = [
    "Start building an emergency fund with at least 3-6 months of expenses",
    "Pay off high-interest debt before investing",
    "Take advantage of employer 401(k) matching if available",
    "Create and stick to a monthly budget",
    "Review your credit report annually",
    "Consider automating your savings",
    "Diversify your investment portfolio",
    "Start saving for retirement as early as possible"
];

// Display a random financial tip
function displayRandomTip() {
    const randomIndex = Math.floor(Math.random() * financialTips.length);
    const tip = financialTips[randomIndex];
    addMessage(tip, 'bot');
}

// Add message to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    // Format the text
    let formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\`(.*?)\`/g, '<code>$1</code>') // Code
        .replace(/\n/g, '<br>'); // Line breaks
    
    messageDiv.innerHTML = `<p>${formattedText}</p>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gemini API Integration
const API_KEY = 'AIzaSyCjY7df6DPC8YCAQv7tWrGtO1XVX9nIAQ8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function generateGeminiResponse(message) {
    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a financial literacy assistant. Your role is to provide clear, accurate, and helpful information about personal finance topics. Keep your responses concise and focused on the specific question asked. If the question is unclear, ask for clarification. Current question: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        // Check for errors in the response
        if (data.error) {
            throw new Error(data.error.message);
        }

        // Parse the response based on the Gemini API structure
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const text = candidate.content.parts[0].text;
                if (text) {
                    return text;
                }
            }
        }

        // If we get here, the response structure is unexpected
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "I apologize, but I'm having trouble connecting to the financial knowledge base. Please try again later or ask a different question.";
    }
}

// Handle user input
async function handleUserInput() {
    const message = userInput.value.trim();
    if (message) {
        addMessage(message, 'user');
        userInput.value = '';
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'bot', 'loading');
        loadingDiv.innerHTML = '<p>Thinking...</p>';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        try {
            const response = await generateGeminiResponse(message);
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            addMessage(response, 'bot');
        } catch (error) {
            // Remove loading indicator
            chatMessages.removeChild(loadingDiv);
            addMessage("I apologize, but I'm having trouble processing your request. Please try again later.", 'bot');
        }
    }
}

// Event listeners for chat
sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
    }
});

// Calculator Functions
function calculateBudget() {
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    
    if (isNaN(income) || isNaN(expenses)) {
        document.getElementById('budget-result').innerHTML = 'Please enter valid numbers';
        return;
    }
    
    const savings = income - expenses;
    const savingsPercentage = (savings / income) * 100;
    
    let result = '';
    if (savings >= 0) {
        result = `You can save $${savings.toFixed(2)} per month (${savingsPercentage.toFixed(1)}% of income)`;
    } else {
        result = `You're spending $${Math.abs(savings).toFixed(2)} more than you earn each month`;
    }
    
    document.getElementById('budget-result').innerHTML = result;
}

function calculateSavings() {
    const goalAmount = parseFloat(document.getElementById('goal-amount').value);
    const monthlySavings = parseFloat(document.getElementById('monthly-savings').value);
    
    if (isNaN(goalAmount) || isNaN(monthlySavings)) {
        document.getElementById('savings-result').innerHTML = 'Please enter valid numbers';
        return;
    }
    
    const monthsToGoal = Math.ceil(goalAmount / monthlySavings);
    const yearsToGoal = (monthsToGoal / 12).toFixed(1);
    
    const result = `It will take ${monthsToGoal} months (${yearsToGoal} years) to reach your savings goal of $${goalAmount.toFixed(2)}`;
    document.getElementById('savings-result').innerHTML = result;
}

// Initialize
displayRandomTip(); 