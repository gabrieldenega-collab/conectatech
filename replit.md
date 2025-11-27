# ConectaTech Summit

## Visão Geral
Site de eventos de tecnologia desenvolvido em HTML, CSS e JavaScript puro (sem Node.js, sem backend). O projeto utiliza uma arquitetura SPA (Single Page Application) e integra-se diretamente com a API do Airtable para gerenciamento de dados.

## Funcionalidades Principais
- **Lista de Eventos**: Visualização de todos os eventos disponíveis
- **Sessões de Eventos**: Detalhamento de sessões por evento específico
- **Sistema de Autenticação**: Registro e login de utilizadores
- **Gestão de Inscrições**: Inscrição e cancelamento em eventos e sessões
- **Meus Eventos**: Visualização dos eventos nos quais o utilizador está inscrito
- **Minhas Sessões**: Visualização das sessões nas quais o utilizador está inscrito

## Estrutura do Projeto
```
.
├── index.html       # Estrutura HTML com todas as páginas SPA
├── style.css        # Estilos modernos com tema escuro
├── script.js        # Lógica da aplicação e integração Airtable
└── replit.md        # Documentação do projeto
```

## Configuração

### Configurar Credenciais do Airtable
Antes de usar o site, você precisa configurar suas credenciais do Airtable no arquivo `script.js`:

1. Abra o arquivo `script.js`
2. No topo do arquivo, preencha as constantes:
```javascript
const AIRTABLE_BASE_ID = "seu_base_id_aqui";
const AIRTABLE_TOKEN = "seu_token_aqui";
```

### Estrutura do Banco de Dados Airtable
O projeto espera as seguintes tabelas no Airtable:

**Tabela: eventos**
- nome (text)
- data (text)
- local (text)
- descricao (text)

**Tabela: sessoes**
- evento_id (text) - ID do evento relacionado
- titulo (text)
- palestrante (text)
- horario (text)
- sala (text)
- descricao (text)

**Tabela: utilizadores**
- nome (text)
- email (text)
- password (text)
- telefone (text)

**Tabela: inscricoes**
- utilizador_id (text) - ID do utilizador
- evento_id (text) - ID do evento

**Tabela: inscricoes_sessoes**
- utilizador_id (text) - ID do utilizador
- sessao_id (text) - ID da sessão

## Tecnologias Utilizadas
- **HTML5**: Estrutura semântica
- **CSS3**: Design responsivo e moderno com tema escuro
- **JavaScript ES6+**: Lógica da aplicação
- **Fetch API**: Comunicação com Airtable
- **LocalStorage**: Gerenciamento de sessão do utilizador

## Características Técnicas
- SPA com navegação sem reload de página
- Design responsivo para dispositivos móveis
- Tema escuro moderno inspirado em eventos tech
- Autenticação persistente via LocalStorage
- Integração completa com API REST do Airtable

## Segurança e Limitações

⚠️ **IMPORTANTE**: Como este é um projeto 100% client-side (sem backend), existem limitações de segurança inerentes:

1. **Token Airtable Exposto**: O token do Airtable fica visível no código JavaScript, permitindo que qualquer pessoa com acesso ao código fonte possa visualizar e usar suas credenciais. Recomenda-se:
   - Usar um token com permissões mínimas necessárias
   - Restringir o acesso às tabelas específicas do projeto
   - Considerar implementar um backend no futuro para proteger as credenciais

2. **Senhas em Texto Puro**: As senhas são armazenadas sem criptografia no Airtable. Para uso em produção, considere:
   - Implementar hashing de senhas (pelo menos SHA-256 no cliente)
   - Usar um serviço de autenticação dedicado
   - Adicionar autenticação OAuth quando possível

3. **Uso Recomendado**: Este projeto é ideal para:
   - Protótipos e demonstrações
   - Ambientes de desenvolvimento e teste
   - Projetos internos com dados não sensíveis

Para ambientes de produção com dados sensíveis, recomenda-se implementar um backend que gerencie as credenciais e a autenticação de forma segura.

## Última Atualização
26 de novembro de 2025

## Estado Atual
Projeto completo e funcional, pronto para configuração das credenciais Airtable. Inclui proteções contra XSS e injeção de fórmulas.
