import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { MessageCircle, Phone, Mail, Send, Headphones } from 'lucide-react';

const staticMessages = [
  { id: 1, from: 'bot', text: 'Hello! How can we help you with your delivery today?', time: new Date().toISOString() },
  { id: 2, from: 'bot', text: 'You can track your package, request a pickup, or ask about pricing.', time: new Date().toISOString() },
];

export default function CustomerSupport() {
  const [messages, setMessages] = useState(staticMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEnd = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), from: 'user', text: input, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        'Your package ORD-001 is currently in transit and expected to arrive on time.',
        'Sure! You can request a pickup from your dashboard.',
        'Our standard rates start at ₦5,000 for local deliveries.',
        'I understand your concern. Let me check your order status.',
        'You can reach our dispatch team at +234-800-LOGIMOVE.',
        'Yes, we offer inter-state delivery services across Nigeria.',
        'Your feedback has been noted. Thank you for reaching out!',
      ];
      const botMsg = { id: Date.now() + 1, from: 'bot', text: responses[Math.floor(Math.random() * responses.length)], time: new Date().toISOString() };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Customer Support</Typography>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Headphones size={22} />
          </Box>
          <Box><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>LogiMove Support</Typography><Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Typically replies in a few minutes</Typography></Box>
        </Box>
        <Box sx={{ height: 400, overflow: 'auto', p: 2.5, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {messages.map(msg => (
            <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
              <Box sx={{
                maxWidth: '80%',
                borderRadius: msg.from === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                px: 2,
                py: 1.5,
                bgcolor: msg.from === 'user' ? 'primary.main' : 'background.paper',
                color: msg.from === 'user' ? 'white' : 'text.primary',
                border: msg.from === 'user' ? 'none' : '1px solid',
                borderColor: 'divider',
              }}>
                <Typography variant="body2">{msg.text}</Typography>
                <Typography variant="caption" sx={{ color: msg.from === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', mt: 0.5 }}>
                  {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Box>
            </Box>
          ))}
          {isTyping && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px 16px 16px 4px', px: 2, py: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[0, 1, 2].map(i => <Box key={i} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'text.disabled', animation: i === 0 ? 'none' : 'none' }} />)}
                </Box>
              </Box>
            </Box>
          )}
          <div ref={chatEnd} />
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
          />
          <Button variant="contained" onClick={handleSend} sx={{ borderRadius: 3, minWidth: 44, px: 2 }}>
            <Send size={18} />
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent sx={{ textAlign: 'center', py: 3 }}>
            <IconButton color="primary" sx={{ mb: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
              <Phone size={20} />
            </IconButton>
            <Typography variant="subtitle2">Call Us</Typography>
            <Typography variant="caption" color="text.secondary">+234 810 512 9505</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent sx={{ textAlign: 'center', py: 3 }}>
            <IconButton color="primary" sx={{ mb: 1, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
              <Mail size={20} />
            </IconButton>
            <Typography variant="subtitle2">Email</Typography>
            <Typography variant="caption" color="text.secondary">bigsmart2026@gmail.com</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card><CardContent sx={{ textAlign: 'center', py: 3 }}>
            <IconButton color="success" sx={{ mb: 1, bgcolor: 'success.main', color: 'white', '&:hover': { bgcolor: 'success.dark' } }}>
              <MessageCircle size={20} />
            </IconButton>
            <Typography variant="subtitle2">WhatsApp</Typography>
            <Button size="small" onClick={() => window.open('https://wa.me/2348105129505?text=Hello%20LogiMove%2C%20I%20need%20help%20with%20my%20delivery', '_blank')} sx={{ textTransform: 'none', fontSize: '0.75rem' }}>Chat on WhatsApp</Button>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
