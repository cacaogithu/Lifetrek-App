-- Insert the Fatigue Validation Guide Carousel into linkedin_carousels
WITH first_user AS (
    SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1
)
INSERT INTO public.linkedin_carousels (
    admin_user_id,
    profile_type,
    topic,
    target_audience,
    pain_point,
    desired_outcome,
    proof_points,
    cta_action,
    caption,
    format,
    slides,
    generation_metadata,
    created_at,
    updated_at
)
SELECT 
    id, -- admin_user_id from the first user found or null (hopefully exists)
    'company',
    'Redução de Riscos em Testes de Fadiga de Implantes',
    'Engenheiros de P&D, Gerentes de Qualidade, Diretores de Operações (MedTech)',
    'Falhas tardias em testes de fadiga (após meses de dev) e custos de retrabalho ($50k+)',
    'Validar física e microestrutura antes do teste final para garantir aprovação regulatória',
    'Framework Lifetrek, ISO 13485, Histórico de zero falhas em submissões',
    'Baixar "Fluxo de Validação de Fadiga" (Link na Bio)',
    'Prototipagem Rápida vs. Validação Real: Você sabe a diferença? ⚠️

A impressão 3D revolucionou o design médico. Mas ela mente.
Ela diz que seu implante encaixa. Diz que é ergonômico.
O que ela NÃO diz: Se ele vai aguentar 5 milhões de ciclos.

No desenvolvimento de implantes Classe III, pular a etapa de usinagem CNC de precisão antes dos testes finais é um jogo perigoso.

Desenvolvemos um framework interno na Lifetrek para blindar nossos projetos contra falhas tardias. E decidimos abrir esse processo.

📑 Novo Guia: Fluxo de Validação de Fadiga (Do CAD ao Teste)

Baixe gratuitamente para ver:
- Quando usar 3D vs CNC
- Parâmetros críticos de usinagem para fadiga
- Checklist de pré-submissão regulatória

🔗 [Link na Bio: lifetrek.io/resources/fatigue-validation-guide]

#medtech #medicaldevices #engineering #iso13485 #lifetrek #manufacturing',
    'carousel',
    '[
      {
        "type": "hook",
        "headline": "Seu implante falhou na fadiga? 📉",
        "body": "Não culpe o design (ainda). A culpa pode ser do processo de validação."
      },
      {
        "type": "content",
        "headline": "O ''Vale da Morte'' da Validação",
        "body": "Muitos validam a geometria em 3D (resina) e pulam direto para o lote piloto. Quando falha, volta para o início. ❌ 6 meses perdidos. ❌ $50k+ em retestes."
      },
      {
        "type": "content",
        "headline": "O Elo Perdido: Prototipagem CNC",
        "body": "A impressão 3D valida a forma. A usinagem CNC em material real (Ti F136/PEEK) valida a física."
      },
      {
        "type": "content",
        "headline": "O que validar antes da fadiga?",
        "body": "✅ Tolerâncias de Mícron\n✅ Acabamento Superficial (Ra)\n✅ Anisotropia do material real"
      },
      {
        "type": "cta",
        "headline": "Baixe o Fluxo Completo (Grátis)",
        "body": "Mapeamos todas as decisões críticas do CAD até a aprovação ANVISA/FDA. Link na Bio."
      }
    ]'::jsonb,
    '{"model": "manual-insertion", "strategy": "fatigue-guide-launch"}'::jsonb,
    NOW(),
    NOW()
FROM first_user;
