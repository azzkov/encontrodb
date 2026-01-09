import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TextField, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getSystemConfig, updateSystemConfig } from './configService';
import dayjs from 'dayjs';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [limite, setLimite] = useState(50);
  const [message, setMessage] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newParticipant, setNewParticipant] = useState({
    nome: '',
    dataNascimento: null,
    idade: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadParticipantes();
        loadConfig();
      }
    });
    return unsubscribe;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('Login realizado com sucesso!');
    } catch (error) {
      setMessage('Erro no login. Verifique suas credenciais.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setParticipantes([]);
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = dayjs();
    const birth = dayjs(birthDate);
    return Math.floor(today.diff(birth, 'year', true));
  };

  const handleDateChange = (date) => {
    setNewParticipant(prev => ({
      ...prev,
      dataNascimento: date,
      idade: calculateAge(date)
    }));
  };

  const addParticipant = async () => {
    if (!newParticipant.nome || !newParticipant.dataNascimento) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (participantes.length >= limite) {
      setMessage('Limite de participantes atingido.');
      return;
    }

    try {
      await addDoc(collection(db, 'participantes'), {
        nome: newParticipant.nome,
        dataNascimento: newParticipant.dataNascimento.toDate(),
        idade: newParticipant.idade,
        dataInscricao: new Date(),
        status: 'inscrito'
      });
      
      setNewParticipant({ nome: '', dataNascimento: null, idade: '' });
      setShowAddDialog(false);
      loadParticipantes();
      setMessage('Participante adicionado com sucesso.');
    } catch (error) {
      setMessage('Erro ao adicionar participante.');
    }
  };

  const loadConfig = async () => {
    try {
      const config = await getSystemConfig();
      setLimite(config.limiteParticipantes);
    } catch (error) {
      setMessage('Erro ao carregar configuração.');
    }
  };

  const loadParticipantes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'participantes'));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dataNascimento: doc.data().dataNascimento?.toDate(),
        dataInscricao: doc.data().dataInscricao?.toDate()
      }));
      setParticipantes(data);
    } catch (error) {
      setMessage('Erro ao carregar participantes.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Data Nascimento', 'Idade', 'Data Inscrição', 'Status'];
    const csvContent = [
      headers.join(','),
      ...participantes.map(p => [
        p.nome,
        p.dataNascimento?.toLocaleDateString('pt-BR'),
        p.idade,
        p.dataInscricao?.toLocaleDateString('pt-BR'),
        p.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participantes.csv';
    a.click();
  };

  const updateLimit = async () => {
    try {
      await updateSystemConfig({ limiteParticipantes: limite });
      setShowLimitDialog(false);
      setMessage(`Limite atualizado para ${limite} participantes.`);
    } catch (error) {
      setMessage('Erro ao atualizar limite.');
    }
  };

  const removeParticipante = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este participante?')) {
      try {
        await deleteDoc(doc(db, 'participantes', id));
        loadParticipantes();
        setMessage('Participante removido com sucesso.');
      } catch (error) {
        setMessage('Erro ao remover participante.');
      }
    }
  };

  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5'
      }}>
        <Container maxWidth="sm">
          <Paper sx={{ p: 4 }}>
            <Typography variant="h4" textAlign="center" gutterBottom>
              Admin - Encontro Pastoral
            </Typography>
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 2 }}
              />
              {message && (
                <Alert severity={message.includes('sucesso') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}
              <Button type="submit" fullWidth variant="contained">
                Entrar
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Participantes ({participantes.length}/{limite})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => setShowAddDialog(true)}>
            Adicionar Participante
          </Button>
          <Button variant="outlined" onClick={() => setShowLimitDialog(true)}>
            Definir Limite
          </Button>
          <Button variant="contained" onClick={exportToCSV}>
            Exportar CSV
          </Button>
          <Button variant="outlined" onClick={handleLogout}>
            Sair
          </Button>
        </Box>
      </Box>

      {message && (
        <Alert severity={message.includes('sucesso') ? 'success' : 'error'} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Data Nasc.</TableCell>
              <TableCell>Idade</TableCell>
              <TableCell>Data Inscrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participantes.map((participante) => (
              <TableRow key={participante.id}>
                <TableCell>{participante.nome}</TableCell>
                <TableCell>
                  {participante.dataNascimento?.toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={participante.idade} 
                    color={participante.idade <= 18 ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {participante.dataInscricao?.toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell>
                  <Chip label={participante.status} color="success" size="small" />
                </TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => removeParticipante(participante.id)}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Participante</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TextField
              fullWidth
              label="Nome Completo *"
              value={newParticipant.nome}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, nome: e.target.value }))}
              sx={{ mt: 2, mb: 2 }}
            />
            <DatePicker
              label="Data de Nascimento *"
              value={newParticipant.dataNascimento}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              maxDate={dayjs()}
            />
            <TextField
              fullWidth
              label="Idade"
              value={newParticipant.idade}
              disabled
              sx={{ mb: 2 }}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancelar</Button>
          <Button onClick={addParticipant} variant="contained">Adicionar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showLimitDialog} onClose={() => setShowLimitDialog(false)}>
        <DialogTitle>Definir Limite de Participantes</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Limite"
            type="number"
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLimitDialog(false)}>Cancelar</Button>
          <Button onClick={updateLimit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;