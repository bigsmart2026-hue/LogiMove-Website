import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from '@mui/material/Alert';
import { MessageCircle, Phone, Mail, Send, Headphones, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { addSupportMessage, fetchSupportMessages } from '../firebase/services';
import toast from 'react-hot-toast';

export default function CustomerSupport() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    fetchSupportMessages().then(all => {
      setReports(all.filter(m => m.type === 'report'));
      setMessages(all.filter(m => m.type !== 'report').slice(0, 50));
    }).catch(() => {});
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now().toString(), from: user?.name || 'User', text: input, time: new Date().toISOString(), type: 'chat' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    addSupportMessage(userMsg).catch(() => {});
    setIsTyping(true);
    setTimeout(() => {
      const responses = [
        'Your package is currently in transit and expected to arrive on time.',
        'Sure! You can request a pickup from your dashboard.',
        'Our standard rates start at ₦5,000 for local deliveries.',
        'I understand your concern. Let me check your order status.',
        'You can reach our dispatch team at +234-800-LOGIMOVE.',
        'Yes, we offer inter-state delivery services across Nigeria.',
        'Your feedback has been noted. Thank you for reaching out!',
      ];
      const botMsg = { id: (Date.now() + 1).toString(), from: 'Support Agent', text: responses[Math.floor(Math.random() * responses.length)], time: new Date().toISOString(), type: 'chat' };
      setMessages(prev => [...prev, botMsg]);
      addSupportMessage(botMsg).catch(() => {});
      setIsTyping(false);
    }, 1200);
  };

  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDesc.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      const report = {
        type: 'report',
        from: user?.name || 'Anonymous',
        email: user?.email || 'unknown@email.com',
        title: reportTitle,
        description: reportDesc,
        time: new Date().toISOString(),
        status: 'open',
      };
      await addSupportMessage(report);
      setReports(prev => [report, ...prev]);
      toast.success('Report submitted successfully!');
      setReportTitle('');
      setReportDesc('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.email === 'bigsmart2026@gmail.com' || user?.role === 'admin';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4">Support & Reports</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Live Chat" />
        <Tab label={isAdmin ? 'Reports Inbox' : 'Report an Issue'} />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, color: 'white' }}>
            <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={22} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>LogiMove Support</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>Typically replies in a few minutes</Typography>
            </Box>
          </Box>
          <Box sx={{ height: 400, overflow: 'auto', p: 2.5, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.disabled">No messages yet. Start a conversation!</Typography>
              </Box>
            )}
            {messages.map(msg => (
              <Box key={msg.id} sx={{ display: 'flex', justifyContent: msg.from === user?.name ? 'flex-end' : 'flex-start' }}>
                <Box sx={{
                  maxWidth: '80%',
                  borderRadius: msg.from === user?.name ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  px: 2, py: 1.5,
                  bgcolor: msg.from === user?.name ? 'primary.main' : 'background.paper',
                  color: msg.from === user?.name ? 'white' : 'text.primary',
                  border: msg.from === user?.name ? 'none' : '1px solid',
                  borderColor: 'divider',
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25, opacity: 0.8 }}>
                    {msg.from === user?.name ? 'You' : msg.from}
                  </Typography>
                  <Typography variant="body2">{msg.text}</Typography>
                  <Typography variant="caption" sx={{ color: msg.from === user?.name ? 'rgba(255,255,255,0.7)' : 'text.secondary', display: 'block', mt: 0.5 }}>
                    {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '16px 16px 16px 4px', px: 2, py: 1.5 }}>
                  <Typography variant="caption" color="text.disabled">Support is typing...</Typography>
                </Box>
              </Box>
            )}
            <div ref={chatEnd} />
          </Box>
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type your message..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }} />
            <Button variant="contained" onClick={handleSend} sx={{ borderRadius: 3, minWidth: 44, px: 2 }}><Send size={18} /></Button>
          </Box>
        </Paper>
      )}

      {tab === 1 && !isAdmin && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Report an Issue</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Submit a report or complaint and our team will get back to you.</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Title" value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="e.g., Delayed delivery, Damaged package" fullWidth />
            <TextField label="Description" value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe your issue in detail..." multiline rows={4} fullWidth />
            <Button variant="contained" onClick={handleSubmitReport} disabled={submitting} startIcon={<AlertTriangle size={18} />} sx={{ alignSelf: 'flex-start', borderRadius: 2 }}>
              {submitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Box>

          {reports.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Your Reports</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {reports.slice(0, 5).map((r, i) => (
                  <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>{r.title}</Typography>
                      <Chip label={r.status} size="small" color={r.status === 'open' ? 'warning' : 'success'} variant="filled" sx={{ fontWeight: 600 }} />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{r.description}</Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>{new Date(r.time).toLocaleString()}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {tab === 1 && isAdmin && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Reports Inbox</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Customer reports and complaints.</Typography>
          {reports.length === 0 ? (
            <Alert severity="info">No reports yet.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(r.time).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{r.from}<br /><Typography variant="caption" color="text.disabled">{r.email}</Typography></TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.title}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</TableCell>
                      <TableCell><Chip label={r.status} size="small" color={r.status === 'open' ? 'warning' : 'success'} variant="filled" sx={{ fontWeight: 600 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

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
