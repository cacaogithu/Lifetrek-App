# Lifetrek Medical - Email Templates

Este diretório contém templates de email HTML profissionais e responsivos para campanhas de outreach da Lifetrek Medical.

## 📋 Templates Disponíveis

### 1. Base Template (`base-template.html`)
Template base com toda a estrutura de branding da Lifetrek. Use como referência para criar novos templates.

**Características:**
- Header com logo e tagline
- Seções de conteúdo personalizáveis
- Botões CTA com cores da marca
- Footer com certificações e links
- Design responsivo para mobile

### 2. Cold Email - Ortopedia (`cold-email-orthopedic.html`)
Template para primeiro contato com fabricantes de dispositivos ortopédicos.

**Uso:**
- Sistemas de trauma e coluna
- Implantes ortopédicos
- Parafusos e placas

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[linhas específicas / trauma / coluna]` - Linha de produtos específica
- `[mercado / país X]` - Mercado/país de atuação

### 3. Cold Email - Odontologia (`cold-email-dental.html`)
Template para primeiro contato com empresas de implantes dentários.

**Uso:**
- Implantes dentários
- Pilares e componentes
- Kits cirúrgicos odontológicos

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[mercado X]` - Mercado de atuação

### 4. Follow-up Template (`follow-up-template.html`)
Template para emails de acompanhamento (2ª ou 3ª tentativa de contato).

**Uso:**
- Retomar conversas sem resposta
- Adicionar valor com case studies
- Oferecer múltiplas opções de próximo passo

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[tipo de componente/nicho]` - Tipo de componente mencionado anteriormente
- `[nicho similar]` - Nicho similar para case study

### 5. Reply - Inbound Inquiry (`reply-inbound-inquiry.html`)
Template para responder consultas recebidas (inbound).

**Uso:**
- Responder leads que entraram em contato
- Qualificar o projeto
- Solicitar informações técnicas

**Personalizações necessárias:**
- `[NOME]` - Nome do destinatário
- `[tipo de componente/projeto]` - Tipo de componente/projeto mencionado
- `[EMPRESA]` - Nome da empresa
- `[aplicação/nicho]` - Aplicação ou nicho específico
- `[NICHO]` - Nicho para experiência relevante
- `[SEU NOME]` - Nome do vendedor/engenheiro

## 🎨 Guia de Branding

### Cores Principais
- **Primary Blue:** `#004F8F` - Botões CTA, títulos principais
- **Primary Blue Hover:** `#003D75` - Estados hover
- **Innovation Green:** `#1A7A3E` - Destaques positivos, checkmarks
- **Energy Orange:** `#F07818` - Chamadas de atenção, urgência
- **Text Primary:** `#2C3E50` - Texto principal
- **Text Muted:** `#5A6C7D` - Texto secundário
- **Background Light:** `#F5F7FA` - Fundos suaves

### Tipografia
- **Font Family:** Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Body Text:** 16px (15px em mobile)
- **Headings:** 20-28px, font-weight: 700
- **Line Height:** 1.7 para legibilidade

### Componentes Reutilizáveis

#### Highlight Box
```html
<div class="highlight-box">
    <p>Texto destacado com borda azul</p>
</div>
```

#### CTA Button
```html
<div class="cta-container">
    <a href="[LINK]" class="cta-button">Texto do Botão</a>
</div>
```

#### Feature List
```html
<div class="value-props">
    <div class="value-item">
        <div class="value-icon">
            <div class="value-icon-circle">✓</div>
        </div>
        <div class="value-content">
            <div class="value-title">Título</div>
            <div class="value-desc">Descrição</div>
        </div>
    </div>
</div>
```

## 📱 Responsividade

Todos os templates são responsivos e otimizados para:
- Desktop (600px+)
- Tablet (480px - 600px)
- Mobile (< 480px)

### Breakpoints
- `@media only screen and (max-width: 600px)` - Ajustes para mobile

## ✅ Checklist de Personalização

Antes de enviar um email, verifique:

- [ ] Substituir todos os placeholders `[NOME]`, `[EMPRESA]`, etc.
- [ ] Verificar links de CTA (mailto, URLs)
- [ ] Confirmar informações de contato no footer
- [ ] Testar em diferentes clientes de email (Gmail, Outlook, Apple Mail)
- [ ] Verificar ortografia e gramática
- [ ] Confirmar que o nicho/segmento está correto

## 🧪 Testes

### Clientes de Email Testados
- ✅ Gmail (Web, iOS, Android)
- ✅ Outlook (Web, Desktop)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ ProtonMail

### Ferramentas de Teste Recomendadas
- [Litmus](https://litmus.com/) - Teste em múltiplos clientes
- [Email on Acid](https://www.emailonacid.com/) - Validação de renderização
- [Mail Tester](https://www.mail-tester.com/) - Score de deliverability

## 📊 Melhores Práticas

### Subject Lines (Assuntos)
- Máximo 50 caracteres
- Específico ao nicho
- Evitar palavras de spam ("grátis", "urgente", etc.)
- Mencionar certificação ou benefício claro

**Exemplos:**
- ✅ "Fornecedor ISO 13485 p/ sistemas de trauma e coluna"
- ✅ "Apoio em usinagem de implantes odontológicos"
- ❌ "Oportunidade incrível para sua empresa!"

### Corpo do Email
- Máximo 150-200 palavras para cold emails
- Personalização na primeira linha
- Um problema claro + uma solução
- CTA único e específico
- Tom consultivo, não vendedor

### Timing
- Melhores dias: Terça, Quarta, Quinta
- Melhores horários: 9h-11h ou 14h-16h (horário de Brasília)
- Evitar: Segunda de manhã, Sexta à tarde, finais de semana

### Follow-up Cadence
1. **Dia 0:** Cold email inicial
2. **Dia 3:** Follow-up com valor adicional (case study)
3. **Dia 7:** Follow-up final com múltiplas opções
4. **Dia 14:** Breakup email (porta aberta)

## 🔗 Integração com CRM

Estes templates podem ser integrados com:
- Supabase (já configurado no projeto)
- HubSpot
- Pipedrive
- ActiveCampaign

### Campos de Merge Tags
Para automação, use estas variáveis:
- `{{contact.first_name}}` → Nome
- `{{contact.company}}` → Empresa
- `{{contact.industry}}` → Nicho/Indústria
- `{{contact.product_line}}` → Linha de produtos
- `{{contact.country}}` → País/Mercado

## 📝 Notas de Implementação

### Para Desenvolvedores
- Todos os estilos são inline para compatibilidade
- Tabelas usadas para layout (padrão em email HTML)
- Reset CSS incluído para normalização
- Imagens devem ser hospedadas externamente (CDN)

### Para Equipe de Vendas
- Sempre personalizar a primeira linha
- Mencionar algo específico da empresa/produto
- Manter tom profissional mas acessível
- Focar em "big fast value" (valor rápido)
- Um CTA claro por email

## 📞 Suporte

Para dúvidas sobre os templates:
- **Técnicas:** Equipe de desenvolvimento
- **Conteúdo:** Equipe de marketing/vendas
- **Design:** Seguir BRAND_BOOK.md na raiz do projeto

## 🔄 Versionamento

- **v1.0** (Dez 2024) - Templates iniciais criados
  - Base template
  - Cold email ortopedia
  - Cold email odontologia
  - Follow-up
  - Reply inbound

---

**Última atualização:** Dezembro 2024  
**Mantido por:** Equipe Lifetrek Medical
