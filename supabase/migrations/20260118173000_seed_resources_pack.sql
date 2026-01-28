INSERT INTO public.resources (
  title,
  description,
  content,
  type,
  persona,
  status,
  slug,
  metadata
)
VALUES
(
  'Checklist DFM para Implantes e Instrumentais',
  'Checklist tatico para revisao de desenho antes de cotar usinagem.',
  $$## Objetivo
Checklist rapido para revisar desenho antes de cotar usinagem.

## Geometria critica
- SIM / NAO: Furos profundos (>= 6x diametro) mapeados. Observacao: ______
- SIM / NAO: Transicoes abruptas suavizadas (raios definidos). Observacao: ______
- SIM / NAO: Roscas com entrada e alivio definidos. Observacao: ______

## Diametro x profundidade por material
- SIM / NAO: Proporcao validada para Ti, inox e PEEK. Observacao: ______
- SIM / NAO: Acessos de ferramenta confirmados para Swiss-type. Observacao: ______

## Tolerancias
- SIM / NAO: Tolerancias funcionais separadas das nao criticas. Observacao: ______
- SIM / NAO: Cotas criticas com metodo de medicao definido. Observacao: ______

## Rugosidade e acabamento
- SIM / NAO: Ra definido para zonas de contato. Observacao: ______
- SIM / NAO: Acabamento alinhado com processo (eletropolimento/passivacao). Observacao: ______

## Saida recomendada
- Se 2+ itens ficaram em NAO, revisar antes de orcamento.
$$,
  'checklist',
  'Engenharia / P&D',
  'published',
  'dfm-checklist-implantes-instrumentais',
  '{"category": "dfm"}'::jsonb
),
(
  'Checklist de Auditoria ISO 13485 para Usinagem',
  'Checklist para QA/RA auditar fornecedores de usinagem medica.',
  $$## Sistema de qualidade
- SIM / NAO: ISO 13485 vigente e escopo aplicavel. Observacao: ______
- SIM / NAO: CAPA ativo e rastreavel. Observacao: ______
- SIM / NAO: Documentacao controlada (SOP, registros). Observacao: ______

## Metrologia
- SIM / NAO: CMM disponivel e calibrada. Observacao: ______
- SIM / NAO: Laudos dimensionais por lote. Observacao: ______
- SIM / NAO: Calibracao rastreavel (RBC/INMETRO). Observacao: ______

## Rastreabilidade
- SIM / NAO: Lote, materia-prima, operador e maquina. Observacao: ______
- SIM / NAO: Historico por serial/lote. Observacao: ______

## Limpeza e embalagem
- SIM / NAO: Sala limpa/ambiente controlado quando aplicavel. Observacao: ______
- SIM / NAO: Registros de limpeza e inspeção. Observacao: ______

## Change control
- SIM / NAO: ECN com aprovacao e validacao. Observacao: ______
- SIM / NAO: Revalidacao quando muda processo/material. Observacao: ______
$$,
  'checklist',
  'Qualidade / RA',
  'published',
  'iso-13485-auditoria-usinagem',
  '{"category": "qa"}'::jsonb
),
(
  'Scorecard de Risco de Supply Chain 2026',
  'Scorecard simples para mapear risco da cadeia em dispositivos medicos.',
  $$## Como usar
Avalie cada risco de 1 a 5 (1 baixo, 5 alto). Some tudo e interprete a faixa.

## Riscos
- Dependencia geografica (1-5): ______
- Volatilidade cambial/materia-prima (1-5): ______
- Lead time e logistica (1-5): ______
- Qualidade/compliance fornecedor (1-5): ______
- Capital preso em estoque (1-5): ______

## Interpretacao
- 5-10: Risco baixo. Manter monitoramento.
- 11-18: Risco medio. Criar plano de contingencia.
- 19-25: Risco alto. Avaliar nearshoring/fornecedor local critico.
$$,
  'guide',
  'Supply Chain / CFO',
  'published',
  'scorecard-risco-supply-chain-2026',
  '{"category": "supply-chain"}'::jsonb
),
(
  'Roadmap de 90 Dias para Migrar 1-3 SKUs',
  'Plano curto para migrar itens de importado para producao local.',
  $$## Objetivo
Executar um piloto seguro com 1-3 SKUs sem travar o MRP.

## Semanas 1-2
- NDA + selecao de SKUs
- Envio de desenhos e requisitos
- Kickoff tecnico

## Semanas 3-6
- DFM e ajustes de desenho
- Prototipo CNC
- Validacao metrologica

## Semanas 7-12
- 1o lote produtivo
- Ajustes de estoque e MRP
- Revisao de custo e qualidade

## Saida
- Se aprovado, escalar para SKUs adjacentes.
$$,
  'guide',
  'Supply Chain / Operacoes',
  'published',
  'roadmap-90-dias-migracao-skus',
  '{"category": "roadmap"}'::jsonb
),
(
  'Checklist: Quando Faz Sentido Produzir Local',
  'Checklist de decisao rapida para avaliar nearshoring.',
  $$## Criterios (SIM/NAO)
- SIM / NAO: Volume anual relevante
- SIM / NAO: Lead time de importacao > X dias
- SIM / NAO: Alto impacto se faltar (linha para)
- SIM / NAO: Problemas recorrentes de qualidade/NC
- SIM / NAO: Alto valor em estoque parado

## Interpretacao
- 3+ SIM: Avaliar piloto local.
- 4-5 SIM: Prioridade alta para migracao.
$$,
  'checklist',
  'CFO / Compras',
  'published',
  'checklist-producao-local',
  '{"category": "decision"}'::jsonb
)
ON CONFLICT (slug)
DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  type = EXCLUDED.type,
  persona = EXCLUDED.persona,
  status = EXCLUDED.status,
  metadata = EXCLUDED.metadata,
  updated_at = timezone('utc'::text, now());
