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
import 'dayjs/locale/pt-br';

const InscricaoPage = ({ onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: null,
    idade: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(true);
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

      if (formData.idade < 18) {
        setShowForm(false);
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
    // Abrir o documento HTML em nova janela para impressão/download
    const newWindow = window.open('/autorizacao-menor-idade.html', '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        setTimeout(() => {
          newWindow.print();
        }, 500);
      };
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
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
        {showForm && (
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
                06, 07 e 08 de Fevereiro de 2026
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
                  format="DD/MM/YYYY"
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
        )}

        <Dialog 
          open={showAuthDialog} 
          onClose={() => setShowAuthDialog(false)}
          maxWidth="sm"
          fullWidth
          sx={{ zIndex: 3000 }}
        >
          <DialogTitle sx={{ textAlign: 'center', color: '#00959E', fontSize: '1.5rem' }}>
            Inscrição Realizada com Sucesso!
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#FFD700', mb: 2 }}>
              Autorização Necessária
            </Typography>
            <Typography sx={{ mb: 3, lineHeight: 1.6 }}>
              Como você é menor de idade, será necessário comparecer ao evento com a autorização 
              dos pais/responsáveis devidamente preenchida e assinada para ter sua entrada liberada.
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              Clique no botão abaixo para fazer o download do documento de autorização.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 2 }}>
            <Button 
              onClick={downloadAuthorization} 
              variant="contained"
              sx={{ 
                bgcolor: '#FFD700', 
                color: '#000',
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: '#E6C200' }
              }}
            >
              Imprimir Autorização
            </Button>
            <Button 
              onClick={() => { setShowAuthDialog(false); onClose(); }}
              variant="outlined"
              sx={{ px: 4 }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default InscricaoPage;