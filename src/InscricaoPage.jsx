import { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, Paper, 
  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import dayjs from 'dayjs';

const InscricaoPage = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: null,
    idade: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = dayjs();
    const birth = dayjs(birthDate);
    return Math.floor(today.diff(birth, 'year', true));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dataNascimento: date,
      idade: calculateAge(date)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.dataNascimento) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const { getSystemConfig } = await import('./configService');
      
      // Verificar limite de participantes
      const [participantesQuery, config] = await Promise.all([
        getDocs(query(collection(db, 'participantes'))),
        getSystemConfig()
      ]);
      
      if (participantesQuery.size >= config.limiteParticipantes) {
        setMessage('Limite de participantes atingido. Inscrições encerradas.');
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'participantes'), {
        nome: formData.nome,
        dataNascimento: formData.dataNascimento.toDate(),
        idade: formData.idade,
        dataInscricao: new Date(),
        status: 'inscrito'
      });

      if (formData.idade <= 18) {
        setShowAuthDialog(true);
      } else {
        setMessage('Inscrição realizada com sucesso!');
        setTimeout(() => onClose(), 2000);
      }
    } catch (error) {
      setMessage('Erro ao realizar inscrição. Tente novamente.');
    }
    setLoading(false);
  };

  const downloadAuthorization = () => {
    // Link para download da autorização
    const link = document.createElement('a');
    link.href = 'https://exemplo.com/autorizacao.pdf'; // Substitua pelo link real
    link.download = 'autorizacao-menor-idade.pdf';
    link.click();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        bgcolor: 'rgba(0,0,0,0.8)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        zIndex: 2000
      }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4, position: 'relative' }}>
            <Button 
              onClick={onClose}
              sx={{ position: 'absolute', top: 8, right: 8 }}
            >
              ✕
            </Button>
            
            <Typography variant="h4" textAlign="center" gutterBottom color="#00959E">
              2º Encontro Pastoral
            </Typography>
            <Typography variant="h6" textAlign="center" gutterBottom>
              Festa de Dom Bosco Lá no Céu!
            </Typography>
            <Typography textAlign="center" sx={{ mb: 3 }}>
              06, 07 e 08 de Fevereiro de 2025
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Nome Completo *"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                sx={{ mb: 2 }}
              />

              <DatePicker
                label="Data de Nascimento *"
                value={formData.dataNascimento}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
                maxDate={dayjs()}
              />

              <TextField
                fullWidth
                label="Idade"
                value={formData.idade}
                disabled
                sx={{ mb: 3 }}
              />

              {message && (
                <Alert severity={message.includes('sucesso') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ 
                  bgcolor: '#00959E', 
                  '&:hover': { bgcolor: '#007A82' },
                  py: 1.5
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Inscrever-se'}
              </Button>
            </form>
          </Paper>
        </Container>

        <Dialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)}>
          <DialogTitle>Autorização Necessária</DialogTitle>
          <DialogContent>
            <Typography>
              Como você é menor de idade, será necessário comparecer ao evento com a autorização 
              dos pais/responsáveis em mãos para ter sua entrada liberada.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={downloadAuthorization} variant="contained">
              Baixar Autorização
            </Button>
            <Button onClick={() => { setShowAuthDialog(false); onClose(); }}>
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default InscricaoPage;