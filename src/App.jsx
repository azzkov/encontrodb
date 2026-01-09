import { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Container, Grid, Card, CardContent, 
  Accordion, AccordionSummary, AccordionDetails, Avatar, Chip, Box,
  Tabs, Tab, IconButton, Drawer, List, ListItem, ListItemText,
  createTheme, ThemeProvider, Fab, Zoom, Grow, Slide, Fade
} from '@mui/material';
import { 
  Menu as MenuIcon, ExpandMore, Schedule, LocationOn, 
  Group, Flag, ExpandMore as ExpandMoreIcon, KeyboardArrowUp
} from '@mui/icons-material';
import InscricaoPage from './InscricaoPage';
import AdminPage from './AdminPage';

// Theme customization
const theme = createTheme({
  typography: {
    fontFamily: '"Open Sans", "Arial", "Raleway", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }
      }
    }
  }
});

// Header Component
const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tabs = [
    { id: 'inicio', label: 'Início' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'programacao', label: 'Programação' },
    { id: 'organizadores', label: 'Organizadores' },
    { id: 'informacoes', label: 'Informações' },
    { id: 'glossario', label: 'Glossário' }
  ];

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <AppBar position="fixed" sx={{ bgcolor: '#00959E', zIndex: 1300 }}>
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{ 
              height: window.innerWidth < 600 ? 40 : 60, 
              marginRight: window.innerWidth < 600 ? 8 : 16 
            }} 
          />
        </Box>
        
        <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              color="inherit"
              onClick={() => scrollToSection(tab.id)}
              sx={{ 
                mx: 0.5,
                fontSize: { md: '0.8rem', lg: '0.875rem' },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        <IconButton
          color="inherit"
          sx={{ display: { xs: 'block', md: 'none' } }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>

        <Drawer
          anchor="right"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          <List sx={{ width: 250 }}>
            {tabs.map(tab => (
              <ListItem 
                key={tab.id} 
                button 
                onClick={() => scrollToSection(tab.id)}
              >
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
};

// Início Component
const Inicio = ({ onOpenInscricao, inscricoesEncerradas }) => (
  <Box 
    id="inicio" 
    sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #316B8F, #45A5BF)',
      display: 'flex',
      alignItems: 'center',
      pt: { xs: 10, sm: 8 },
      px: { xs: 2, sm: 0 }
    }}
  >
    <Container maxWidth="lg" sx={{ textAlign: 'center', color: 'white' }}>
      <Typography 
        variant="h2" 
        component="h1" 
        gutterBottom 
        sx={{ 
          fontWeight: 300,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3.75rem' }
        }}
      >
        2º Encontro Pastoral
      </Typography>
      <Typography 
        variant="h5" 
        sx={{ 
          opacity: 0.9,
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
          mb: 2
        }}
      >
        Festa de Dom Bosco Lá no Céu!
      </Typography>
      <Typography 
        variant="h6" 
        sx={{ 
          opacity: 0.9,
          fontSize: { xs: '1rem', sm: '1.25rem' },
          mb: 4
        }}
      >
        Seja Muito Bem Vindo!
      </Typography>
      
      {inscricoesEncerradas && (
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            color: '#FFD700',
            fontWeight: 'bold',
            fontSize: { xs: '1rem', sm: '1.1rem' }
          }}
        >
          Obrigado pelo interesse! As inscrições foram encerradas, mas continue acompanhando nossos próximos eventos.
        </Typography>
      )}
      
      <Grow in={true} timeout={1200}>
        <Button
          variant="contained"
          size="large"
          onClick={onOpenInscricao}
          disabled={inscricoesEncerradas}
          sx={{
            bgcolor: inscricoesEncerradas ? '#666' : '#FFD700',
            color: inscricoesEncerradas ? '#ccc' : '#000',
            fontWeight: 'bold',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            px: { xs: 4, sm: 5 },
            py: { xs: 2, sm: 2.5 },
            borderRadius: 4,
            boxShadow: inscricoesEncerradas ? 'none' : '0 8px 32px rgba(255, 215, 0, 0.4)',
            animation: inscricoesEncerradas ? 'none' : 'pulse 2s infinite',
            cursor: inscricoesEncerradas ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': inscricoesEncerradas ? {} : { 
              bgcolor: '#E6C200',
              transform: 'scale(1.05) translateY(-2px)',
              boxShadow: '0 16px 48px rgba(255, 215, 0, 0.5)'
            },
            '&:active': inscricoesEncerradas ? {} : {
              transform: 'scale(0.98)'
            },
            '@keyframes pulse': {
              '0%': { boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' },
              '50%': { boxShadow: '0 8px 32px rgba(255, 215, 0, 0.7)' },
              '100%': { boxShadow: '0 8px 32px rgba(255, 215, 0, 0.4)' }
            }
          }}
        >
          {inscricoesEncerradas ? 'INSCRIÇÕES ENCERRADAS' : 'INSCREVER-SE AGORA'}
        </Button>
      </Grow>
    </Container>
  </Box>
);

// Sobre Component
const Sobre = () => {
  const cards = [
    { icon: <Flag sx={{ fontSize: { xs: 36, sm: 48 }, color: '#316B8F' }} />, title: 'Objetivo Geral', content: 'Promover a integração e formação pastoral da comunidade através de atividades espirituais e educativas.' },
    { icon: <Schedule sx={{ fontSize: { xs: 36, sm: 48 }, color: '#316B8F' }} />, title: 'Quando?', content: '06, 07 e 08 de Fevereiro de 2025' },
    { icon: <LocationOn sx={{ fontSize: { xs: 36, sm: 48 }, color: '#316B8F' }} />, title: 'Onde?', content: 'CESAM Goiânia - Alameda dos Buritis, 485, Setor Oeste - Goiânia/GO', hasMap: true },
    { icon: <Group sx={{ fontSize: { xs: 36, sm: 48 }, color: '#316B8F' }} />, title: 'Participantes', content: 'Jovens aprendizes e educadores do CESAM Goiânia' }
  ];

  return (
    <Box 
      id="sobre" 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #45A5BF, #378399)',
        py: { xs: 4, sm: 8 },
        px: { xs: 2, sm: 0 }
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 300, 
            color: 'white',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Sobre o Evento
        </Typography>
        <Grid container spacing={{ xs: 3, sm: 4 }} justifyContent="center" alignItems="stretch">
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: { xs: 2, sm: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <CardContent sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Box sx={{ mb: 3 }}>{card.icon}</Box>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom 
                      color="#316B8F"
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 600, mb: 2 }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '0.95rem' }, 
                        lineHeight: 1.6,
                        mb: card.hasMap ? 3 : 0
                      }}
                    >
                      {card.content}
                    </Typography>
                  </Box>
                  {card.hasMap && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => window.open('https://maps.google.com/?q=Alameda+dos+Buritis,+485,+Setor+Oeste,+Goiânia,+GO', '_blank')}
                      sx={{
                        color: '#316B8F',
                        borderColor: '#316B8F',
                        mt: 'auto',
                        '&:hover': { 
                          bgcolor: 'rgba(49, 107, 143, 0.1)',
                          transform: 'scale(1.05)'
                        }
                      }}
                    >
                      Ver no Mapa
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// Programação Component
const Programacao = () => {
  const [activeDay, setActiveDay] = useState(0);

  const programacao = [
    [
      { horario: '19h', evento: 'Chegada e Recepção', detalhes: 'Responsável: Equipe de Animação e Acolhida' },
      { horario: '19h30', evento: 'Jantar', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '20h30', evento: 'Acolhida, Orientações e Apresentação da Plenária Eletiva dos Aprendizes Representantes', detalhes: 'Responsável: Coordenação Geral' },
      { horario: '21h', evento: 'Louvor Noturno', detalhes: 'Responsável: Equipe de Oração' },
      { horario: '22h', evento: 'Recolhimento', detalhes: 'Responsável: Coordenação Geral' }
    ],
    [
      { horario: '07h', evento: 'Despertar', detalhes: 'Responsável: Sineteiro' },
      { horario: '08h', evento: 'Oração da Manhã - Bom Dia!', detalhes: 'Responsável: Equipe de Oração' },
      { horario: '8h30', evento: 'Café da manhã', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '09h', evento: '1ª Oficina - Paraliturgia: Exposição do Santíssimo Sacramento e sua liturgia', detalhes: 'Responsável: Convidado' },
      { horario: '10h20', evento: 'Intervalo e lanchinho', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '10h40', evento: '2ª Oficina - Protagonismo Juvenil na Pastoral Salesiana e a JMS no CESAM GOIÂNIA', detalhes: 'Responsável: Robert Trajano' },
      { horario: '11h55', evento: 'Angelus - Oração', detalhes: 'Responsável: Equipe de Oração' },
      { horario: '12h', evento: 'Almoço', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '13h30', evento: '3ª Oficina - Liturgia', detalhes: 'Responsável: Wallison da Silva' },
      { horario: '14h50', evento: 'Intervalo, Lanchinho e Pátio', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '17h', evento: 'Higiene', detalhes: 'Responsável: Coordenação Geral' },
      { horario: '18h', evento: 'Momento Mariano - Santo Terço', detalhes: 'Responsável: Equipe de Oração' },
      { horario: '19h', evento: 'Festa no céu de Dom Bosco à Fantasia com jantar', detalhes: 'Responsável: Equipe da Festa' },
      { horario: '21h30', evento: 'Oração Noturna, Higiene pessoal e Recolhimento', detalhes: 'Responsável: Equipe de Oração' }
    ],
    [
      { horario: '06h', evento: 'Despertar e Higiene Pessoal', detalhes: 'Responsável: Sineteiro' },
      { horario: '07h', evento: 'Santa Missa na Paróquia Dom Bosco', detalhes: 'Responsável: Liturgia paroquial' },
      { horario: '08h30', evento: 'Café da manhã', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '09h', evento: '4ª Oficina – Experiências Salesianas e a morte de Dom Bosco (seus últimos anos)', detalhes: 'Responsável: Karlla Khristine Rodrigues Silva' },
      { horario: '10h', evento: 'Plenária Eletiva', detalhes: 'Responsável: Wallison e Jeniffer' },
      { horario: '10h30', evento: 'Nomeações dos Aprendizes Agentes de Pastoral e Entrega dos emblemas', detalhes: 'Responsável: Rosângela e Rogério, Wallison e Jeniffer' },
      { horario: '11h55', evento: 'Angelus – Oração', detalhes: 'Responsável: Equipe de Oração' },
      { horario: '12h', evento: 'Almoço', detalhes: 'Responsável: Equipe de Cozinha' },
      { horario: '13h00', evento: 'Despedida, Avisos e Encerramento', detalhes: 'Responsável: Coordenação Geral' }
    ]
  ];

  return (
    <Box 
      id="programacao" 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #378399, #206B80)',
        py: 8
      }}
    >
      <Container maxWidth="lg" sx={{ color: 'white', px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 300,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Programação do Evento
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Tabs 
            value={activeDay} 
            onChange={(e, newValue) => setActiveDay(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ 
              '& .MuiTab-root': { 
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minWidth: { xs: 100, sm: 140 },
                fontWeight: 500,
                transition: 'all 0.3s ease'
              },
              '& .Mui-selected': { 
                color: '#FFD700 !important',
                transform: 'scale(1.05)'
              },
              '& .MuiTabs-indicator': { 
                backgroundColor: '#FFD700',
                height: 3,
                borderRadius: 2
              }
            }}
          >
            <Tab label="06/02" />
            <Tab label="07/02" />
            <Tab label="08/02" />
          </Tabs>
        </Box>
        
        <Box>
          {programacao[activeDay].map((item, index) => (
            <Accordion 
              key={index}
              sx={{ 
                mb: 2, 
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: 2,
                '&:before': { display: 'none' },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  transform: 'translateX(8px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                sx={{ py: 1.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Chip 
                    label={item.horario} 
                    sx={{ 
                      bgcolor: '#FFD700', 
                      color: '#000', 
                      fontWeight: 'bold',
                      fontSize: { xs: '0.75rem', sm: '0.85rem' },
                      minWidth: { xs: 60, sm: 80 }
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      flexGrow: 1,
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 500
                    }}
                  >
                    {item.evento}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '0.85rem', sm: '0.95rem' },
                  lineHeight: 1.6,
                  pl: { xs: 0, sm: 2 }
                }}>
                  {item.detalhes}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

// Organizadores Component
const Organizadores = () => {
  const [selectedPerson, setSelectedPerson] = useState(null);

  const organizadores = {
    diretores: [
      { nome: 'Rogério do Vale', foto: '/fotos/rogerio.jfif', funcoes: ['Gerente Administrativo - CESAM Goiânia'] },
      { nome: 'Rosângela Rodrigues', foto: '/fotos/rosangela.jfif', funcoes: ['Diretora Executiva - CESAM Goiânia'] }
    ],
    pastorais: [
      { nome: 'Robert Trajano', foto: '/fotos/robert.jfif', funcoes: ['Coordenador Pastoral da Presença', 'Formação: Administração de Empresas'] },
      { nome: 'Walison da Silva', foto: '/fotos/wallison.jfif', funcoes: ['Animador Pastoral CESAM Goiânia', 'Formação: Teologia e Letras'] }
    ],
    secretarias: [
      { nome: 'Jeniffer Nogueira', foto: '/fotos/jeniffer.jfif', funcoes: ['Animadora Pastoral CESAM Goiânia', 'Formação: Pedagogia'] },
      { nome: 'Paula Araújo', foto: '/fotos/paula.jfif', funcoes: ['Analista Departamento Pessoal', 'Formação: Pedagogia e Gestão de RH'] }
    ],
    comissao: [
      { nome: 'Angélica Mariano', foto: '/fotos/angelica.jfif', funcoes: ['Assis. Departamento Pessoal', 'Formação: Ciências Contábeis'] },
      { nome: 'Carollyne Oliveira', foto: '/fotos/carol.jfif', funcoes: ['Instrutora', 'Formação: Letras/Libras'] },
      { nome: 'Claudenice Santiago', foto: '/fotos/claudenice.jfif', funcoes: ['Assistente Social', 'Formação: Serviço Social'] },
      { nome: 'Edivan Batista de Lima', foto: '/fotos/edivan.jpeg', funcoes: ['Instrutor', 'Formação: Análista de Sistemas e Segurança da Informação'] },
      { nome: 'Isamara Santana', foto: '/fotos/isamara.jfif', funcoes: ['Instrutora', 'Formação: Pedagogia'] },
      { nome: 'Jonatas Peres', foto: '/fotos/jonatas.jfif', funcoes: ['Instrutor', 'Formação: Arquiteto'] },
      { nome: 'Joyce Azeredo', foto: '/fotos/joyce.jfif', funcoes: ['Auxiliar Administrativo', 'Formação: Pedagogia e Enfermagem'] },
      { nome: 'Mônica Godoi', foto: '/fotos/monica.jfif', funcoes: ['Instrutora', 'Formação: Pedagogia'] },
      { nome: 'Nelimar Herculano', foto: '/fotos/nelimar.jfif', funcoes: ['Analista Departamento Pessoal', 'Formação: Pedagogia e Gestão de RH'] },
      { nome: 'Rodrigo Neres', foto: '/fotos/rodrigo.jfif', funcoes: ['Auxiliar de Manutenção Predial'] },
      { nome: 'Thais Lamarão', foto: '/fotos/thais.jfif', funcoes: ['Captadora', 'Formação: Letras'] },
    ]
  };

  const PersonCard = ({ pessoa, index, sectionKey }) => {
    const personKey = `${sectionKey}-${index}`;
    const isSelected = selectedPerson === personKey;
    
    return (
      <Card 
        sx={{ 
          textAlign: 'center', 
          p: 2,
          bgcolor: 'rgba(255,255,255,0.1)',
          color: 'white',
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'translateY(-5px)' }
        }}
      >
        <CardContent>
          <Avatar 
            src={pessoa.foto} 
            alt={pessoa.nome}
            sx={{ 
              width: { xs: 80, sm: 120 }, 
              height: { xs: 80, sm: 120 }, 
              mx: 'auto', 
              mb: 2,
              border: '3px solid rgba(255,255,255,0.3)'
            }}
          />
          <Typography variant="h6" gutterBottom>
            {pessoa.nome}
          </Typography>
          <Button 
            variant="outlined"
            onClick={() => setSelectedPerson(isSelected ? null : personKey)}
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
            }}
          >
            Ver Funções
          </Button>
          {isSelected && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {pessoa.funcoes.map((funcao, i) => (
                <Chip 
                  key={i} 
                  label={funcao} 
                  size="small"
                  title={funcao}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    maxWidth: '100%',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box 
      id="organizadores" 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #206B80, #055166)',
        py: 8
      }}
    >
      <Container maxWidth="lg" sx={{ color: 'white', px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 300,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Organizadores do Evento
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 3, color: '#FFD700' }}>
            Direção Geral
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <PersonCard pessoa={{ nome: 'Pr. Wagner Gama', foto: '/fotos/wagner.png', funcoes: ['Diretor Geral da Obra'] }} index={0} sectionKey="diretor-geral" />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 3, color: '#FFD700' }}>
            Equipe Diretiva
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {organizadores.diretores.map((pessoa, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PersonCard pessoa={pessoa} index={index} sectionKey="diretores" />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 3, color: '#FFD700' }}>
            Coordenadores do Evento
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {organizadores.pastorais.map((pessoa, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PersonCard pessoa={pessoa} index={index} sectionKey="pastorais" />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 3, color: '#FFD700' }}>
            Secretárias
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {organizadores.secretarias.map((pessoa, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PersonCard pessoa={pessoa} index={index} sectionKey="secretarias" />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 3, color: '#FFD700' }}>
            Membros da Comissão de Pastoral
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center' }}>
            {organizadores.comissao.slice(0, 5).map((pessoa, index) => (
              <Box key={index} sx={{ width: { xs: '100%', sm: '45%', md: '18%' } }}>
                <PersonCard pessoa={pessoa} index={index} sectionKey="comissao" />
              </Box>
            ))}
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mt: 3 }}>
            {organizadores.comissao.slice(5).map((pessoa, index) => (
              <Box key={index + 5} sx={{ width: { xs: '100%', sm: '45%', md: '22%' } }}>
                <PersonCard pessoa={pessoa} index={index + 5} sectionKey="comissao" />
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// Informações Component
const Informacoes = ({ onOpenInscricao, inscricoesEncerradas }) => {
  const informacoes = [
    {
      titulo: 'Inscrições',
      conteudo: 'As inscrições serão feitas por esse botão ou no começo da página do evento.',
      botao: true
    },
    {
      titulo: 'Hospedagem',
      conteudo: 'A hospedagem dos participantes será em salas de aula adaptadas para o evento. Trazer colchão, saco de dormir e itens pessoais. Haverá banheiros disponíveis no local.'
    },
    {
      titulo: 'Alimentação',
      conteudo: 'Todas as refeições estão incluídas na inscrição: café da manhã, almoço e lanche da tarde. Informar previamente sobre restrições alimentares ou necessidades especiais.'
    },
    {
      titulo: 'Material Necessário',
      conteudo: 'Trazer Bíblia, caderno para anotações e caneta. Todo material complementar será fornecido pela organização. Recomenda-se roupa confortável e adequada para atividades religiosas.'
    }
  ];

  return (
    <Box 
      id="informacoes" 
      sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #055166, #033D49)',
        py: 8
      }}
    >
      <Container maxWidth="lg" sx={{ color: 'white', px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom 
          sx={{ 
            mb: 4, 
            fontWeight: 300,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
          }}
        >
          Informações
        </Typography>
        <Box>
          {informacoes.map((info, index) => (
            <Accordion 
              key={index}
              sx={{ 
                mb: 1, 
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                '&:before': { display: 'none' }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
                <Typography variant="h6">{info.titulo}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: info.botao ? 2 : 0 }}>
                  {info.conteudo}
                </Typography>
                {info.botao && (
                  <Button
                    variant="contained"
                    disabled={inscricoesEncerradas}
                    sx={{
                      bgcolor: inscricoesEncerradas ? '#666' : '#FFD700',
                      color: inscricoesEncerradas ? '#ccc' : '#000',
                      fontWeight: 'bold',
                      cursor: inscricoesEncerradas ? 'not-allowed' : 'pointer',
                      '&:hover': inscricoesEncerradas ? {} : { bgcolor: '#E6C200' }
                    }}
                    onClick={() => onOpenInscricao()}
                  >
                    {inscricoesEncerradas ? 'Inscrições Encerradas' : 'Inscrever-se'}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

// Glossário Component
const Glossario = () => (
  <Box 
    id="glossario" 
    sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #033D49, #00959E)',
      py: 8
    }}
  >
    <Container maxWidth="lg" sx={{ color: 'white', px: { xs: 2, sm: 3 } }}>
      <Typography 
        variant="h3" 
        component="h2" 
        textAlign="center" 
        gutterBottom 
        sx={{ 
          mb: 4, 
          fontWeight: 300,
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
        }}
      >
        Glossário
      </Typography>
      
      <Box>
        <Typography variant="h4" textAlign="center" gutterBottom sx={{ mb: 4, color: '#FFD700' }}>
          Termos Pastorais
        </Typography>
        
        <Box sx={{ '& > *': { mb: 3 } }}>
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Pastoral</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Atividade da Igreja voltada para o cuidado espiritual e material dos fiéis, seguindo o exemplo de Jesus Cristo como Bom Pastor.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Catequese</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Processo de educação na fé cristã, que visa formar e instruir os fiéis nos ensinamentos da Igreja Católica.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Liturgia</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Conjunto de cerimônias e ritos oficiais da Igreja, especialmente a celebração da Eucaristia e dos sacramentos.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Pastoral Social</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Dimensão da ação pastoral voltada para a promoção da justiça social e o cuidado com os mais necessitados.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Pastoral Familiar</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Ação evangelizadora direcionada às famílias, promovendo valores cristãos no ambiente doméstico.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="h5" gutterBottom sx={{ color: '#87CEEB' }}>Pastoral da Juventude</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>
              Ministério específico voltado para o acompanhamento e formação dos jovens na fé cristã.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  </Box>
);

// Footer Component
const Footer = () => (
  <Box component="footer" sx={{ bgcolor: '#00959E', color: 'white', py: 4 }}>
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', gap: 4, mb: 4 }}>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
            Contato
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>📞(62) 3920-9800</Typography>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
            Endereço
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 1 }}>Alameda dos Buritis, 485</Typography>
          <Typography sx={{ opacity: 0.9 }}>Setor Oeste - Goiânia/GO</Typography>
        </Box>
        <Box>
          <Typography variant="h6" gutterBottom sx={{ color: '#FFD700' }}>
            Redes Sociais
          </Typography>
          <Typography sx={{ opacity: 0.9 }}>@cesamgo</Typography>
        </Box>
      </Box>
      <Box sx={{ pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <Typography sx={{ opacity: 0.8 }}>
          &copy; 2026 CESAM Goiânia. Todos os direitos reservados.
        </Typography>
      </Box>
    </Container>
  </Box>
);

// ScrollToTop Component
const ScrollToTop = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Zoom in={showButton}>
      <Fab
        color="primary"
        size="medium"
        onClick={scrollToTop}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          bgcolor: '#00959E',
          '&:hover': { bgcolor: '#007A82' },
          zIndex: 1000
        }}
      >
        <KeyboardArrowUp />
      </Fab>
    </Zoom>
  );
};

// Main App Component
function App() {
  const [scrollY, setScrollY] = useState(0);
  const [showInscricao, setShowInscricao] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [inscricoesEncerradas, setInscricoesEncerradas] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Verificar se é página de admin pela URL
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      setShowAdmin(true);
    }
  }, []);

  // Verificar limite de inscrições
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase');
        const { getSystemConfig } = await import('./configService');
        
        const [participantesSnapshot, config] = await Promise.all([
          getDocs(collection(db, 'participantes')),
          getSystemConfig()
        ]);
        
        setInscricoesEncerradas(participantesSnapshot.size >= config.limiteParticipantes);
      } catch (error) {
        console.log('Erro ao verificar limite');
      }
    };
    checkLimit();
  }, []);

  const handleOpenInscricao = () => {
    if (inscricoesEncerradas) return;
    setShowInscricao(true);
  };

  if (showAdmin) {
    return <AdminPage />;
  }

  return (
    <ThemeProvider theme={theme}>
      <Box>
        <Header />
        <Box component="main" sx={{ pt: { xs: 7, sm: 8 } }}>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.1}px)` } }}>
            <Inicio onOpenInscricao={handleOpenInscricao} inscricoesEncerradas={inscricoesEncerradas} />
          </Box>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.05}px)` } }}>
            <Sobre />
          </Box>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.03}px)` } }}>
            <Programacao />
          </Box>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.02}px)` } }}>
            <Organizadores />
          </Box>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.01}px)` } }}>
            <Informacoes onOpenInscricao={handleOpenInscricao} inscricoesEncerradas={inscricoesEncerradas} />
          </Box>
          <Box sx={{ transform: { xs: 'none', md: `translateY(${scrollY * 0.005}px)` } }}>
            <Glossario />
          </Box>
        </Box>
        <Footer />
        <ScrollToTop />
        
        {showInscricao && (
          <InscricaoPage onClose={() => setShowInscricao(false)} />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;