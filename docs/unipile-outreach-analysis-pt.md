# Análise de Capacidades da Unipile e Impacto em Outreach (Lifetrek)

## Objetivo
Avaliar as capacidades documentadas da Unipile e mapear o impacto nos objetivos de outreach da Lifetrek Medical em cinco segmentos de ICP, com LinkedIn como canal principal e Instagram + Email como canais de apoio. Este documento também define um framework de testes para identificar qual ICP é mais lucrativo.

## Contexto Lifetrek
A Lifetrek Medical é uma empresa de manufatura de precisão especializada em componentes médicos e odontológicos de alta qualidade, com mais de 30 anos de experiência, certificação ISO 13485 e aprovação ANVISA. A estratégia de outreach deve reforçar nosso posicionamento e credibilidade com parceiros globais de dispositivos médicos.

## Alinhamento de Marca
- **Posicionamento:** Engenharia de Precisão para Tecnologia que Salva Vidas.
- **Promessa de marca:** “Entregar componentes de precisão que atendem aos padrões de qualidade mais exigentes na manufatura médica.”
- **Essência da marca:** Precisão • Qualidade • Parceria.
- **Tom de voz:** profissional, preciso, confiável e orientado a parceria.
- **Implicação para outreach:** enfatizar certificações, sistema de qualidade e colaboração de longo prazo em todos os canais.

## Segmentos de ICP (Sem Prioridade)
- Fabricantes de dispositivos médicos (implantes, instrumentos cirúrgicos, fixação de trauma)
- Fabricantes de equipamentos odontológicos (implantes, ferramentas de cirurgia oral)
- Empresas veterinárias (implantes e instrumentos)
- Instituições de saúde (ferramentas customizadas, parcerias de P&D)
- Parceiros de manufatura contratada (OEM, componentes de alta precisão)

## Estratégia de Canais
- **Principal:** LinkedIn (networking, convites, mensagens, posts)
- **Secundário:** Instagram (presença de marca + DMs)
- **Apoio:** Email (nutrição, follow-ups, propostas)

## Inventário de Capacidades da Unipile (Do `unipile-node-sdk/README.md`)
### Conexão de Conta e Autenticação
- Link de Hosted Auth para onboarding de provedores (múltiplos provedores).
- Autenticação customizada para LinkedIn (usuário/senha) e Instagram (usuário/senha).
- Tratamento de checkpoint 2FA/OTP para LinkedIn.
- Resync de conta LinkedIn.

**Impacto em outreach:** onboarding escalável de múltiplas contas, maior resiliência a checkpoints, menor esforço operacional.

### APIs de Mensagens (Multi-Provedor)
- Iniciar chats, enviar mensagens, listar chats, listar mensagens.
- Recuperar chat + participantes; listar participantes em chats.
- Enviar e recuperar anexos.

**Impacto em outreach:** inbox unificado, follow-up automatizado, redução do tempo de resposta.

### Perfis de Usuário e Empresa
- Buscar perfis de usuários e o próprio perfil.
- Buscar perfis de empresas no LinkedIn.

**Impacto em outreach:** enriquecimento de prospects, segmentação por ICP e personalização.

### Capacidades Específicas do LinkedIn
- **Convites:** enviar, listar pendentes, excluir; suporte a notificação de visita de perfil.
- **InMail:** mensagens para pessoas fora da rede.
- **Posts:** listar posts de usuários/empresas, recuperar post, criar post, comentar, listar comentários, reagir.
- **Perfis/Relacionamentos:** listar contatos/relacionamentos.

**Impacto em outreach:** automação de convites, aumento da qualidade de outreach via conteúdo e engajamento, alcance fora da rede e visibilidade do grafo de relacionamento.

### API de Email
- Histórico de emails.
- Enviar, responder e deletar emails.

**Impacto em outreach:** nutrição pós-conexão, follow-ups comerciais e suporte ao processo de compra.

### Extensibilidade do SDK
- Requisições de “raw data” para endpoints não empacotados no SDK.

**Impacto em outreach:** cobertura de gaps por chamadas customizadas quando necessário.

## Mapeamento de Workflow de Outreach (LinkedIn Primeiro)
### 1) Prospecção e Enriquecimento
- Buscar perfis e perfis de empresas no LinkedIn.
- Taggear ICP e registrar firmográficos.
- Capturar contexto de engajamento (posts, reações, comentários).

**Dados capturados:** identificadores de perfil, metadados da empresa, status do relacionamento, interações anteriores.

### 2) Convites de Conexão (CTA principal)
- Enviar convites no LinkedIn.
- Acompanhar pendências e aceites.

**Resultado de negócio:** mais conexões qualificadas com menos esforço manual.

### 3) Mensagens e Follow-ups
- Enviar mensagens no LinkedIn; listar chats e respostas.
- Enviar anexos (apresentações, cases).

**Resultado de negócio:** aumento de resposta e conversão em reuniões; melhora no SLA de atendimento.

### 4) Autoridade e Credibilidade
- Publicar no LinkedIn; comentar e reagir em contas-alvo.

**Resultado de negócio:** outreach mais quente via prova social.

### 5) Outreach Fora da Rede
- Usar InMail para contas estratégicas.

**Resultado de negócio:** acesso a decisores fora da rede.

### 6) Email para Nutrição e Fechamento
- Enviar e responder emails; histórico de conversas.

**Resultado de negócio:** suporte a negociações, propostas e procurement.

### 7) Instagram (Secundário)
- Conectar conta Instagram para mensagens (capacidade de conexão via SDK).
- Usar DMs para marcas com forte apelo visual.

**Resultado de negócio:** alcance incremental em marcas dentais/medtech com presença visual.

> Observação: validar o nível de features do Instagram na lista oficial da Unipile antes de depender de endpoints específicos.

## Matriz de Hipóteses de Valor
| Capacidade | Resultado em Outreach | KPI(s) |
| --- | --- | --- |
| Convites no LinkedIn | Escala de conexões iniciais | Taxa de aceitação, convites/semana |
| Mensagens + lista de chats | Follow-up rápido e rastreio de respostas | Taxa de resposta, tempo até primeira resposta |
| InMail | Alcance fora da rede | Taxa de resposta no InMail, taxa de reunião |
| Posts + engajamento | Aquecimento via prova social | Engajamento, aumento na taxa de aceitação |
| Dados de perfil/empresa | Melhor segmentação e personalização | Taxa de ICP match, aumento de resposta |
| Email (envio/resposta) | Nutrição multitoque | Taxa de resposta, taxa de reunião |
| Anexos | Credibilidade e qualificação | CTR de anexos, taxa de reunião |

## Plano de Experimentos: Encontrar o ICP Mais Lucrativo
### Matriz de Teste
Executar um playbook de outreach padronizado em todos os 5 ICPs:
1. Convite de conexão (LinkedIn)
2. Follow-up (LinkedIn)
3. Toque de conteúdo (post + comentário)
4. Follow-up por email (quando disponível)
5. DM no Instagram para ICPs com forte presença visual

### Métricas Principais
- Taxa de aceitação (LinkedIn)
- Taxa de resposta (LinkedIn + Email)
- Taxa de reunião
- Tempo até a primeira resposta
- Proxy de velocidade de pipeline (reuniões/semana por ICP)

### Regras de Decisão
- **ICP mais lucrativo** = maior pipeline esperado por hora de outreach.
- Exigir tamanho mínimo de amostra por ICP antes de ranquear.
- Repetir testes trimestralmente para capturar mudanças.

## Riscos e Compliance
- **Risco de plataforma:** limites de taxa e políticas anti-automação; aplicar throttling.
- **Saúde da conta:** usar hosted auth + 2FA; monitorar desconexões.
- **Privacidade de dados:** alinhamento com LGPD/GDPR para dados e logs.
- **Risco de dependência:** mapear fallback se cobertura da Unipile mudar.

## Recomendação de MVP
1. Criar um modelo unificado de eventos de outreach (convites, mensagens, respostas, posts).
2. Integrar LinkedIn primeiro com convites + mensagens + enriquecimento de perfil.
3. Adicionar sequências de email para follow-up e fechamento.
4. Adicionar Instagram como canal secundário após validar métricas em LinkedIn.

## Próximos Passos
- Validar profundidade de features do Instagram/LinkedIn na lista oficial da Unipile.
- Definir templates de mensagem por ICP.
- Configurar dashboards para KPIs principais.
