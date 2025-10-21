# Portal de Reclamações / Denúncias (demo)

Essa é uma implementação front-end demonstrativa para criar e gerenciar reclamações/denúncias com foco em privacidade e integridade.

Arquivos principais:
- `index.html` - interface do aluno e do painel da coordenação.
- `style.css` - estilos separados.
- `app.js` - lógica da aplicação (criação de posts, persistência em `localStorage`, filtros, painel da coordenação demo).
- `lib_sha256.js` - implementação SHA-256 para assinatura de integridade.

Usuários e papéis:
- O formulário de registro agora pede o papel do usuário (aluno, professor, coordenador). Esse papel é salvo junto com o usuário no `localStorage` e exibido na UI quando autenticado.

Como a privacidade e integridade são tratadas (resumo):
- Anonimato opcional: o aluno pode marcar a submissão como anônima; nesse caso o nome não é salvo.
- Assinatura de integridade: cada submissão recebe uma assinatura SHA-256 calculada a partir do conteúdo (título, tipo, prioridade, descrição, data). Essa assinatura permite verificar se o conteúdo foi alterado depois de salvo.
- Persistência: os posts são salvos no `localStorage` do navegador (demo). Em produção, isso deve ser armazenado em um backend seguro com controle de acessos.
- Painel da coordenação: protegido por uma senha local (demo). Coordenação pode marcar como resolvido, arquivar, e visualizar a assinatura.

Instruções rápidas:
1. Abra `index.html` em seu navegador.
2. Use "Criar reclamação/denúncia" para enviar uma nova submissão. Marque "Publicar anonimamente" para preservar privacidade.
3. Acesse "Painel Coordenação" e entre com a senha de demonstração `coord1234` para ver todas as submissões e gerenciar estados.

Observações e próximos passos recomendados:
- Trocar o mecanismo de autenticação por um backend real (ex: JWT, OAuth) para ambientes de produção.
- Migrar o armazenamento de `localStorage` para um serviço seguro com criptografia e logs de auditoria.
- Adicionar um mecanismo de verificação offline/externa da assinatura para checar integridade quando necessário.

Segurança e papéis:
- Em produção, atribuição de papéis e controle de acesso deve ser feita no backend com validação e permissões — não confie apenas em campos enviados pelo cliente.

Licença: código de demonstração livre para uso educacional.
# Reclamacoes_E_Denuncias
Projeto dedicado para a aula de Engenharia de Software, lecionado pelo professor Janderson

Problema a ser resolvido:
Sistema de reclamações e denúncias do IFPB, garantindo privacidade dos alunos, priorização por importância e arquivamento após resolução
