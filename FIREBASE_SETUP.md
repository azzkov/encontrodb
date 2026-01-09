# Sistema de Inscrições - Encontro Pastoral

## Configuração do Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto ou use um existente
3. Ative o Firestore Database
4. Ative o Authentication (Email/Password)
5. Copie as configurações do projeto e substitua em `src/firebase.js`

## Configuração do Authentication

1. No Firebase Console, vá em Authentication > Users
2. Adicione um usuário admin manualmente
3. Use este email/senha para acessar `/admin`

## Funcionalidades Implementadas

### Página Principal
- Botão animado "INSCREVER-SE AGORA" no início da página
- Botão adicional na seção de Informações
- Modal de inscrição com validação de idade

### Sistema de Inscrições
- Formulário com Nome, Data de Nascimento e Idade (calculada automaticamente)
- Validação para menores de idade com download de autorização
- Armazenamento no Firestore
- Verificação de limite de participantes

### Página de Admin (`/admin`)
- Login com Firebase Auth
- Visualização de todos os participantes
- Exportação para CSV
- Controle de limite de participantes
- Remoção de participantes
- Indicação visual para menores de idade

## Como usar

1. Configure o Firebase conforme instruções acima
2. Execute `npm run dev`
3. Acesse `http://localhost:5173` para a página principal
4. Acesse `http://localhost:5173/admin` para o painel administrativo

## Estrutura de Dados (Firestore)

Coleção: `participantes`
```json
{
  "nome": "string",
  "dataNascimento": "timestamp",
  "idade": "number",
  "dataInscricao": "timestamp",
  "status": "string"
}
```