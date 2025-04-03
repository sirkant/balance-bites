// Simple script to test OpenAI API connectivity
import 'dotenv/config';
import OpenAI from 'openai';

console.log('Testing OpenAI API connection...');

// Check if API key is available
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('ERROR: OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

console.log(`API key found (starts with ${apiKey.substring(0, 5)}...)`);

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true
});

// Make a simple API call to test connectivity
async function testApiConnection() {
  try {
    console.log('Making test API call to OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hello, are you working?' }],
      max_tokens: 20
    });
    
    console.log('OpenAI API call successful!');
    console.log('Response:', completion.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('ERROR connecting to OpenAI API:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return false;
  }
}

// Run the test
testApiConnection()
  .then(success => {
    if (success) {
      console.log('✅ Connection to OpenAI API confirmed. Your API key is working.');
    } else {
      console.log('❌ Failed to connect to OpenAI API. Please check your API key and network connection.');
    }
  }); 