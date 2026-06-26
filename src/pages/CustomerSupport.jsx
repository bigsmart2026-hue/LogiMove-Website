import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { MessageCircle, Phone, Mail, Send, Headphones, AlertTriangle, Package, Eye } from 'lucide-react';
import { addSupportMessage, fetchSupportMessages } from '../firebase/services';
import toast from 'react-hot-toast';

const botReplies = [
  'Your package is currently in transit and expected to arrive on time.',
  'Sure! You can request a pickup from your dashboard.',
  'Our standard rates start at ₦5,000 for local deliveries.',
  'I understand your concern. Let me check your order status.',
  'You can reach our dispatch team at +234-800-LOGIMOVE.',
  'Yes, we offer inter-state delivery services across Nigeria.',
  'Your feedback has been noted. Thank you for reaching out!',
];

export default function CustomerSupport() {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDark = mode === 'dark';
  const bg = isDark ? '#111827' : '#fff';
  const border = isDark ? '#1f2937' : '#e2e8f0';
  const text = isDark ? '#f3f4f6' : '#0f172a';
  const muted = isDark ? '#6b7280' : '#64748b';
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [reports, setReports] = useState([]);
  const [tab, setTab] = useState(0);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    fetchSupportMessages().then(d => {
      setReports(d.filter(m => m.type === 'report'));
      setMessages(d.filter(m => m.type !== 'report').slice(0, 50));
    }).catch(() => {});
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const m = { id: Date.now().toString(), from: user?.name || 'User', text: input, time: new Date().toISOString(), type: 'chat' };
    setMessages(p => [...p, m]);
    setInput('');
    addSupportMessage(m).catch(() => {});
    setIsTyping(true);
    setTimeout(() => {
      const b = { id: (Date.now() + 1).toString(), from: 'Support Agent', text: botReplies[Math.floor(Math.random() * botReplies.length)], time: new Date().toISOString(), type: 'chat' };
      setMessages(p => [...p, b]);
      addSupportMessage(b).catch(() => {});
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
      const r = { type: 'report', from: user?.name || 'Anonymous', email: user?.email || 'unknown@email.com', title: reportTitle, description: reportDesc, time: new Date().toISOString(), status: 'open' };
      await addSupportMessage(r);
      setReports(p => [r, ...p]);
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
  const isMine = m => m.from === user?.name;

  const hdrs = ['Date', 'From', 'Title', 'Description', 'Status'];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: text, letterSpacing: '-0.02em' }}>Support & Reports</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: border, '& .MuiTab-root': { color: muted, fontSize: '0.7rem', fontWeight: 600, textTransform: 'none', minHeight: 36, '&.Mui-selected': { color: 'hsl(8, 85%, 55%)' } }, '& .MuiTabs-indicator': { bgcolor: 'hsl(8, 85%, 55%)' } }}>
        <Tab label="Live Chat" />
        <Tab label={isAdmin ? 'Reports Inbox' : 'Report an Issue'} />
      </Tabs>

      {tab === 0 && (
        <Paper sx={{ overflow: 'hidden', bgcolor: bg, border: `1px solid ${border}` }}>
          <Box sx={{ bgcolor: '#1e3a5f', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, color: 'white' }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={18} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Package size={16} /><Typography variant="body2" sx={{ fontWeight: 600 }}> LogiMove Support</Typography></Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>Typically replies in a few minutes</Typography>
            </Box>
          </Box>
           <Box sx={{ height: 360, overflow: 'auto', p: 2, bgcolor: isDark ? '#0a0f1a' : '#f8fafc', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.disabled">No messages yet. Start a conversation!</Typography>
              </Box>
            )}
            {messages.map(m => (
                <Box key={m.id} sx={{ display: 'flex', justifyContent: isMine(m) ? 'flex-end' : 'flex-start' }}>
                <Box sx={{
                  maxWidth: '80%',
                  borderRadius: isMine(m) ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  px: 1.5, py: 1,
                  bgcolor: isMine(m) ? 'hsl(8, 85%, 55%)' : bg,
                  color: isMine(m) ? 'white' : text,
                  border: isMine(m) ? 'none' : `1px solid ${border}`,
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.25, opacity: 0.8, fontSize: '0.6rem' }}>
                    {isMine(m) ? 'You' : m.from}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>{m.text}</Typography>
                  <Typography variant="caption" sx={{ color: isMine(m) ? 'rgba(255,255,255,0.7)' : muted, display: 'block', mt: 0.3, fontSize: '0.6rem' }}>
                    {new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Box>
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Box sx={{ bgcolor: bg, border: `1px solid ${border}`, borderRadius: '12px 12px 12px 4px', px: 1.5, py: 1 }}>
                  <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem' }}>Support is typing...</Typography>
                </Box>
              </Box>
            )}
            <div ref={chatEnd} />
          </Box>
          <Box sx={{ p: 1.5, borderTop: `1px solid ${border}`, display: 'flex', gap: 1 }}>
            <TextField fullWidth size="small" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type your message..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 }, '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <Button variant="contained" onClick={handleSend} sx={{ borderRadius: 2, minWidth: 36, px: 1 }}><Send size={14} /></Button>
          </Box>
        </Paper>
      )}

      {tab === 1 && !isAdmin && (
        <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
          <Typography variant="body2" sx={{ color: text, fontWeight: 600, fontSize: '0.75rem', mb: 0.5 }}>Report an Issue</Typography>
          <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', mb: 2, display: 'block' }}>Submit a report or complaint and our team will get back to you.</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField label="Title" value={reportTitle} onChange={e => setReportTitle(e.target.value)} placeholder="e.g., Delayed delivery, Damaged package" fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <TextField label="Description" value={reportDesc} onChange={e => setReportDesc(e.target.value)} placeholder="Describe your issue in detail..." multiline rows={3} fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: muted }, '& .MuiOutlinedInput-notchedOutline': { borderColor: border }, '& .MuiInputBase-input': { color: text } }} />
            <Button variant="contained" onClick={handleSubmitReport} disabled={submitting} startIcon={<AlertTriangle size={14} />} sx={{ alignSelf: 'flex-start', fontSize: '0.75rem' }}>
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
        <Paper sx={{ p: 2, bgcolor: bg, border: `1px solid ${border}` }}>
          <Typography variant="body2" sx={{ color: text, fontWeight: 600, fontSize: '0.75rem', mb: 0.5 }}>Reports Inbox</Typography>
          <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', mb: 2, display: 'block' }}>Customer reports and complaints.</Typography>
          {reports.length === 0 ? (
            <Alert severity="info">No reports yet.</Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {hdrs.map(h => <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>)}
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reports.map((r, i) => (
                    <TableRow key={i} hover onClick={() => { setSelectedReport(r); setReportDialogOpen(true); }} sx={{ cursor: 'pointer' }}>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{new Date(r.time).toLocaleDateString()}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{r.from}<br /><Typography variant="caption" color="text.disabled">{r.email}</Typography></TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.title}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</TableCell>
                      <TableCell><Chip label={r.status} size="small" color={r.status === 'open' ? 'warning' : 'success'} variant="filled" sx={{ fontWeight: 600 }} /></TableCell>
                      <TableCell><Eye size={14} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { bgcolor: bg, color: text, border: `1px solid ${border}` } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle size={18} color="#f59e0b" /> Report Details
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: border }}>
          {selectedReport && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedReport.title}</Typography>
                <Chip label={selectedReport.status} size="small" color={selectedReport.status === 'open' ? 'warning' : 'success'} variant="filled" sx={{ fontWeight: 600 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 600 }}>Submitted by</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{selectedReport.from}</Typography>
                <Typography variant="caption" sx={{ color: muted, fontSize: '0.7rem' }}>{selectedReport.email}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 600 }}>Date Submitted</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{new Date(selectedReport.time).toLocaleString()}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', fontWeight: 600 }}>Description</Typography>
                <Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: isDark ? '#1a1f2e' : '#f8fafc', borderColor: border }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{selectedReport.description}</Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, borderTop: `1px solid ${border}` }}>
          <Button onClick={() => setReportDialogOpen(false)} variant="outlined" sx={{ borderColor: border, color: muted, fontSize: '0.75rem' }}>Close</Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: bg, border: `1px solid ${border}` }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
            <IconButton color="primary" sx={{ mb: 0.5, bgcolor: 'hsla(8, 85%, 55%, 0.12)', color: 'hsl(8, 85%, 55%)', '&:hover': { bgcolor: 'hsla(8, 85%, 55%, 0.25)' } }}>
              <Phone size={16} />
            </IconButton>
            <Typography variant="caption" sx={{ color: text, fontWeight: 600, fontSize: '0.7rem' }}>Call Us</Typography>
            <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', display: 'block' }}>+234 810 512 9505</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: bg, border: `1px solid ${border}` }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
            <IconButton color="primary" sx={{ mb: 0.5, bgcolor: 'hsla(8, 85%, 55%, 0.12)', color: 'hsl(8, 85%, 55%)', '&:hover': { bgcolor: 'hsla(8, 85%, 55%, 0.25)' } }}>
              <Mail size={16} />
            </IconButton>
            <Typography variant="caption" sx={{ color: text, fontWeight: 600, fontSize: '0.7rem' }}>Email</Typography>
            <Typography variant="caption" sx={{ color: muted, fontSize: '0.65rem', display: 'block' }}>bigsmart2026@gmail.com</Typography>
          </CardContent></Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ bgcolor: bg, border: `1px solid ${border}` }}><CardContent sx={{ textAlign: 'center', py: 2 }}>
            <IconButton sx={{ mb: 0.5, bgcolor: '#10b98120', color: '#10b981', '&:hover': { bgcolor: '#10b98140' } }}>
              <MessageCircle size={16} />
            </IconButton>
            <Typography variant="caption" sx={{ color: text, fontWeight: 600, fontSize: '0.7rem' }}>WhatsApp</Typography>
            <Button size="small" onClick={() => window.open('https://wa.me/2348105129505?text=Hello%20LogiMove%2C%20I%20need%20help%20with%20my%20delivery', '_blank')} sx={{ textTransform: 'none', fontSize: '0.65rem', color: 'hsl(8, 85%, 55%)', minWidth: 0, p: 0 }}>Chat on WhatsApp</Button>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
