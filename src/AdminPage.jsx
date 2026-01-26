import { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, TextField, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Pagination,
  Checkbox, FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { getSystemConfig, updateSystemConfig } from './configService';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminPage = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [participantes, setParticipantes] = useState([]);
  const [limite, setLimite] = useState(50);
  const [message, setMessage] = useState('');
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterByDate, setFilterByDate] = useState(null);
  const [filterUnderAge, setFilterUnderAge] = useState(false);
  const [filterAdultAge, setFilterAdultAge] = useState(false);
  const [filterAutorizacaoEntregue, setFilterAutorizacaoEntregue] = useState(false);
  const [filterAutorizacaoPendente, setFilterAutorizacaoPendente] = useState(false);
  const [filterPhoneLast4, setFilterPhoneLast4] = useState('');
  const itemsPerPage = 10;
  const [newParticipant, setNewParticipant] = useState({
    nome: '',
    telefone: '',
    dataNascimento: null,
    idade: '',
    autorizacaoEntregue: false
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

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e, isEdit = false) => {
    const formatted = formatPhone(e.target.value);
    if (isEdit) {
      setEditingParticipant(prev => ({ ...prev, telefone: formatted }));
    } else {
      setNewParticipant(prev => ({ ...prev, telefone: formatted }));
    }
  };

  const handleDateChange = (date) => {
    setNewParticipant(prev => ({
      ...prev,
      dataNascimento: date,
      idade: calculateAge(date)
    }));
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    const today = dayjs();
    const birth = dayjs(birthDate);
    return Math.floor(today.diff(birth, 'year', true));
  };

  const editParticipant = (participant) => {
    setEditingParticipant({
      ...participant,
      dataNascimento: participant.dataNascimento ? dayjs(participant.dataNascimento) : null,
      autorizacaoEntregue: participant.autorizacaoEntregue || false
    });
    setShowEditDialog(true);
  };

  const updateParticipant = async () => {
    if (!editingParticipant.nome || !editingParticipant.dataNascimento) {
      setMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await updateDoc(doc(db, 'participantes', editingParticipant.id), {
        nome: editingParticipant.nome,
        telefone: editingParticipant.telefone || '',
        dataNascimento: editingParticipant.dataNascimento.toDate(),
        idade: editingParticipant.idade,
        autorizacaoEntregue: editingParticipant.autorizacaoEntregue
      });
      
      setShowEditDialog(false);
      setEditingParticipant(null);
      loadParticipantes();
      setMessage('Participante atualizado com sucesso.');
    } catch (error) {
      setMessage('Erro ao atualizar participante.');
    }
  };

  const toggleAutorizacao = async (id, newValue) => {
    try {
      await updateDoc(doc(db, 'participantes', id), {
        autorizacaoEntregue: newValue
      });
      loadParticipantes();
      setMessage('Status de autorização atualizado com sucesso.');
    } catch (error) {
      setMessage('Erro ao atualizar status de autorização.');
    }
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
        telefone: newParticipant.telefone || '',
        dataNascimento: newParticipant.dataNascimento.toDate(),
        idade: newParticipant.idade,
        autorizacaoEntregue: newParticipant.autorizacaoEntregue,
        dataInscricao: new Date(),
        status: 'inscrito'
      });
      
      setNewParticipant({ nome: '', telefone: '', dataNascimento: null, idade: '', autorizacaoEntregue: false });
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
      setCurrentPage(1);
      setSearchTerm('');
    } catch (error) {
      setMessage('Erro ao carregar participantes.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 15;

    // Obter dados filtrados
    const filteredData = getFilteredAndSortedParticipantes();

    // Cabeçalho com título e subtítulo
    doc.setFontSize(20);
    doc.setTextColor(0, 149, 158); // Cor do tema
    doc.setFont(undefined, 'bold');
    doc.text('CESAM Goiânia', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 8;
    doc.setFontSize(14);
    doc.setTextColor(0, 149, 158);
    doc.setFont(undefined, 'bold');
    doc.text('Painel Administrativo', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 6;
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.setFont(undefined, 'normal');
    doc.text('Gestão de Participantes - Relatório Geral', pageWidth / 2, yPosition, { align: 'center' });
    
    // Linha divisória
    yPosition += 3;
    doc.setDrawColor(0, 149, 158);
    doc.setLineWidth(0.5);
    doc.line(14, yPosition, pageWidth - 14, yPosition);
    
    // Informações do relatório
    yPosition += 6;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(`Data do Relatório: ${new Date().toLocaleDateString('pt-BR')}`, 14, yPosition);
    
    yPosition += 5;
    doc.text(`Total de Participantes (com filtros): ${filteredData.length}`, 14, yPosition);
    
    yPosition += 5;
    doc.text(`Limite de Participantes: ${limite}`, 14, yPosition);

    // Filtros aplicados
    yPosition += 5;
    const filterInfo = [];
    if (searchTerm.length >= 3) filterInfo.push(`Nome: "${searchTerm}"`);
    if (filterByDate) filterInfo.push(`Data: ${filterByDate}`);
    if (filterUnderAge) filterInfo.push('Menores de 18 anos');
    if (filterAdultAge) filterInfo.push('18 anos ou mais');
    if (filterAutorizacaoEntregue) filterInfo.push('Autorização Entregue');
    if (filterAutorizacaoPendente) filterInfo.push('Autorização Pendente');
    if (filterPhoneLast4) filterInfo.push(`Telefone: ...${filterPhoneLast4}`);
    
    if (filterInfo.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Filtros aplicados: ${filterInfo.join(' | ')}`, 14, yPosition);
    }
    
    // Dados da tabela
    const data = filteredData.map((p, index) => [
      index + 1,
      p.nome,
      p.telefone || 'N/A',
      p.dataNascimento?.toLocaleDateString('pt-BR') || 'N/A',
      p.idade || 'N/A',
      p.autorizacaoEntregue ? 'Sim' : 'Não',
      p.dataInscricao?.toLocaleDateString('pt-BR') || 'N/A',
      p.status || 'inscrito'
    ]);

    autoTable(doc, {
      head: [['#', 'Nome', 'Telefone', 'Data Nasc.', 'Idade', 'Autorização', 'Data Inscrição', 'Status']],
      body: data,
      startY: yPosition + 8,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [0, 149, 158],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        lineColor: [0, 149, 158],
        lineWidth: 0.5
      },
      bodyStyles: {
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
        lineWidth: 0.3
      },
      alternateRowStyles: {
        fillColor: [245, 250, 250]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        4: { halign: 'center' },
        5: { halign: 'center' },
        7: { halign: 'center' }
      },
      margin: { top: yPosition + 8, left: 14, right: 14 },
      didDrawPage: (data) => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        
        // Rodapé
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${data.pageNumber}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        
        doc.text(
          '© 2026 CESAM Goiânia. Todos os direitos reservados.',
          pageWidth / 2,
          pageHeight - 4,
          { align: 'center' }
        );
      }
    });

    doc.save(`participantes_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const getPaginatedParticipantes = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return participantes.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(participantes.length / itemsPerPage);
  };

  const getFilteredAndSortedParticipantes = () => {
    let filtered = participantes;

    // Filtrar por termo de busca (mínimo 3 caracteres)
    if (searchTerm.length >= 3) {
      filtered = filtered.filter(p =>
        p.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por data de inscrição
    if (filterByDate) {
      filtered = filtered.filter(p => {
        if (!p.dataInscricao) return false;
        const participantDate = p.dataInscricao.toLocaleDateString('pt-BR');
        return participantDate === filterByDate;
      });
    }

    // Filtrar por menores de 18 anos E/OU 18 anos ou mais
    if (filterUnderAge || filterAdultAge) {
      filtered = filtered.filter(p => {
        if (filterUnderAge && filterAdultAge) {
          // Se ambos estão marcados, mostrar todos (sem filtro)
          return true;
        } else if (filterUnderAge) {
          // Se apenas menores de 18
          return p.idade < 18;
        } else if (filterAdultAge) {
          // Se apenas 18 ou mais
          return p.idade >= 18;
        }
      });
    }

    // Filtrar por autorização entregue E/OU pendente
    if (filterAutorizacaoEntregue || filterAutorizacaoPendente) {
      filtered = filtered.filter(p => {
        const entregue = p.autorizacaoEntregue === true;
        if (filterAutorizacaoEntregue && filterAutorizacaoPendente) {
          // Se ambos estão marcados, mostrar todos (sem filtro)
          return true;
        } else if (filterAutorizacaoEntregue) {
          return entregue;
        } else if (filterAutorizacaoPendente) {
          return !entregue;
        }
      });
    }

    // Filtrar por últimos 4 dígitos do telefone
    if (filterPhoneLast4.trim() !== '') {
      filtered = filtered.filter(p => {
        if (!p.telefone) return false;
        const last4Digits = p.telefone.replace(/\D/g, '').slice(-4);
        return last4Digits === filterPhoneLast4;
      });
    }

    // Ordenar alfabeticamente por nome
    filtered = filtered.sort((a, b) =>
      a.nome.toLowerCase().localeCompare(b.nome.toLowerCase())
    );

    return filtered;
  };

  const getUniqueDatesWithCount = () => {
    const dateMap = {};
    participantes.forEach(p => {
      const dateStr = p.dataInscricao?.toLocaleDateString('pt-BR');
      if (dateStr) {
        dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
      }
    });
    return Object.entries(dateMap).sort((a, b) => new Date(b[0].split('/').reverse().join('-')) - new Date(a[0].split('/').reverse().join('-')));
  };

  const getUniqueLast4PhoneDigits = () => {
    const phonesMap = {};
    participantes.forEach(p => {
      if (p.telefone) {
        const last4 = p.telefone.replace(/\D/g, '').slice(-4);
        if (last4.length === 4) {
          phonesMap[last4] = (phonesMap[last4] || 0) + 1;
        }
      }
    });
    return Object.entries(phonesMap).sort((a, b) => b[1] - a[1]);
  };

  const getFilteredPaginatedParticipantes = () => {
    const filtered = getFilteredAndSortedParticipantes();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getFilteredTotalPages = () => {
    const filtered = getFilteredAndSortedParticipantes();
    return Math.ceil(filtered.length / itemsPerPage);
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
          <Button variant="contained" onClick={exportToPDF}>
            Exportar PDF
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

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Pesquisar por nome (mínimo 3 letras)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Digite pelo menos 3 letras..."
          variant="outlined"
          sx={{ mb: 2 }}
        />
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <Typography variant="caption" sx={{ color: 'orange', mt: 1, display: 'block' }}>
            Digite mais {3 - searchTerm.length} letra(s) para filtrar
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Filtrar por data de inscrição:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label="Todas as datas"
            onClick={() => {
              setFilterByDate(null);
              setCurrentPage(1);
            }}
            color={filterByDate === null ? 'primary' : 'default'}
            variant={filterByDate === null ? 'filled' : 'outlined'}
          />
          {getUniqueDatesWithCount().map(([date, count]) => (
            <Chip
              key={date}
              label={`${date} (${count})`}
              onClick={() => {
                setFilterByDate(date);
                setCurrentPage(1);
              }}
              color={filterByDate === date ? 'primary' : 'default'}
              variant={filterByDate === date ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Filtrar por idade:
        </Typography>
        <Chip
          label="Menores de 18 anos"
          onClick={() => {
            setFilterUnderAge(!filterUnderAge);
            setCurrentPage(1);
          }}
          color={filterUnderAge ? 'warning' : 'default'}
          variant={filterUnderAge ? 'filled' : 'outlined'}
          icon={filterUnderAge ? '⚠️' : undefined}
          sx={{ mr: 1 }}
        />
        <Chip
          label="18 anos ou mais"
          onClick={() => {
            setFilterAdultAge(!filterAdultAge);
            setCurrentPage(1);
          }}
          color={filterAdultAge ? 'success' : 'default'}
          variant={filterAdultAge ? 'filled' : 'outlined'}
          icon={filterAdultAge ? '✓' : undefined}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Filtrar por autorização:
        </Typography>
        <Chip
          label="Autorização Entregue"
          onClick={() => {
            setFilterAutorizacaoEntregue(!filterAutorizacaoEntregue);
            setCurrentPage(1);
          }}
          color={filterAutorizacaoEntregue ? 'success' : 'default'}
          variant={filterAutorizacaoEntregue ? 'filled' : 'outlined'}
          icon={filterAutorizacaoEntregue ? '✓' : undefined}
          sx={{ mr: 1 }}
        />
        <Chip
          label="Autorização Pendente"
          onClick={() => {
            setFilterAutorizacaoPendente(!filterAutorizacaoPendente);
            setCurrentPage(1);
          }}
          color={filterAutorizacaoPendente ? 'warning' : 'default'}
          variant={filterAutorizacaoPendente ? 'filled' : 'outlined'}
          icon={filterAutorizacaoPendente ? '⚠️' : undefined}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Filtrar por últimos 4 dígitos do telefone:
        </Typography>
        <TextField
          label="Digite os 4 últimos dígitos"
          value={filterPhoneLast4}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
            setFilterPhoneLast4(value);
            setCurrentPage(1);
          }}
          placeholder="Ex: 1234"
          variant="outlined"
          inputProps={{ maxLength: 4 }}
          sx={{ maxWidth: 300 }}
        />
        {filterPhoneLast4.length > 0 && filterPhoneLast4.length < 4 && (
          <Typography variant="caption" sx={{ color: 'orange', mt: 1, display: 'block' }}>
            Digite mais {4 - filterPhoneLast4.length} dígito(s)
          </Typography>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Data Nasc.</TableCell>
              <TableCell>Idade</TableCell>
              <TableCell>Autorização Entregue</TableCell>
              <TableCell>Data Inscrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getFilteredPaginatedParticipantes().map((participante) => (
              <TableRow key={participante.id}>
                <TableCell>{participante.nome}</TableCell>
                <TableCell>{participante.telefone || 'N/A'}</TableCell>
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
                  <Checkbox
                    checked={!!participante.autorizacaoEntregue}
                    onChange={(e) => toggleAutorizacao(participante.id, e.target.checked)}
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
                    color="primary"
                    onClick={() => editParticipant(participante)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
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

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 3 }}>
        <Pagination 
          count={getFilteredTotalPages()}
          page={currentPage}
          onChange={(event, value) => setCurrentPage(value)}
          color="primary"
        />
      </Box>

      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adicionar Participante</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <TextField
              fullWidth
              label="Nome Completo *"
              value={newParticipant.nome}
              onChange={(e) => setNewParticipant(prev => ({ ...prev, nome: e.target.value }))}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Telefone"
              value={newParticipant.telefone}
              onChange={(e) => handlePhoneChange(e, false)}
              placeholder="(62) 99999-9999"
              inputProps={{ maxLength: 15 }}
              sx={{ mb: 2 }}
            />
            <DatePicker
              label="Data de Nascimento *"
              value={newParticipant.dataNascimento}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
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
            <FormControlLabel
              control={
                <Checkbox
                  checked={newParticipant.autorizacaoEntregue}
                  onChange={(e) => setNewParticipant(prev => ({ ...prev, autorizacaoEntregue: e.target.checked }))}
                />
              }
              label="Autorização Entregue"
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

      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Participante</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
            <TextField
              fullWidth
              label="Nome Completo *"
              value={editingParticipant?.nome || ''}
              onChange={(e) => setEditingParticipant(prev => ({ ...prev, nome: e.target.value }))}
              sx={{ mt: 2, mb: 2 }}
            />
            <TextField
              fullWidth
              label="Telefone"
              value={editingParticipant?.telefone || ''}
              onChange={(e) => handlePhoneChange(e, true)}
              placeholder="(62) 99999-9999"
              inputProps={{ maxLength: 15 }}
              sx={{ mb: 2 }}
            />
            <DatePicker
              label="Data de Nascimento *"
              value={editingParticipant?.dataNascimento}
              onChange={(date) => setEditingParticipant(prev => ({ ...prev, dataNascimento: date, idade: calculateAge(date) }))}
              format="DD/MM/YYYY"
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              maxDate={dayjs()}
            />
            <TextField
              fullWidth
              label="Idade"
              value={editingParticipant?.idade || ''}
              disabled
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={editingParticipant?.autorizacaoEntregue || false}
                  onChange={(e) => setEditingParticipant(prev => ({ ...prev, autorizacaoEntregue: e.target.checked }))}
                />
              }
              label="Autorização Entregue"
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancelar</Button>
          <Button onClick={updateParticipant} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPage;