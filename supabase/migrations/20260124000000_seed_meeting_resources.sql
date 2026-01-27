-- Seed resources from Jan 23 meeting
INSERT INTO public.resources (title, description, content, type, persona, slug, status, metadata)
VALUES 
(
    'Checklist DFM para Implantes e Instrumentais', 
    'Critérios fundamentais de Design for Manufacturing para reduzir custos e tempo de ciclo em usinagem CNC de titânio e aço cirúrgico.', 
    '# Checklist DFM\n\n1. Considere raios de canto internos...\n2. Especifique tolerâncias críticas apenas onde necessário...\n3. Minimize setups de fixação...', 
    'checklist', 
    'Engenharia/P&D', 
    'checklist-dfm-implantes', 
    'published',
    '{"tags": ["DFM", "CNC", "Medical"]}'
),
(
    'Checklist de Auditoria Interna ISO 13485', 
    'Pontos críticos para verificação de conformidade antes de auditorias oficiais de manutenção ou certificação.', 
    '# Checklist ISO 13485\n\n- Controle de Documentos\n- Rastreabilidade de Lote\n- Validação de Processos...', 
    'checklist', 
    'Qualidade/Regulatory', 
    'checklist-auditoria-iso-13485', 
    'published',
    '{"tags": ["ISO 13485", "Quality", "Audit"]}'
),
(
    'Guia: Sala Limpa ISO 7 e Montagem de Kits', 
    'Como a infraestrutura de sala limpa garante a segurança biológica e funcional de dispositivos médicos montados.', 
    '# Sala Limpa ISO 7\n\nNossa infraestrutura permite a montagem de kits cirúrgicos em ambiente controlado...', 
    'guide', 
    'Produção/Ops', 
    'guia-sala-limpa-iso-7', 
    'published',
    '{"tags": ["Clean Room", "ISO 7", "Assembly"]}'
),
(
    'Manual de Metrologia e Inspeção de Alta Precisão', 
    'Técnicas e equipamentos (CMM, Perfilometria) para garantia de qualidade em micropeças médicas.', 
    '# Metrologia Avançada\n\nUtilizamos equipamentos de ponta para garantir precisão sub-mícron...', 
    'guide', 
    'Qualidade/Engenharia', 
    'guia-metrologia-alta-precisao', 
    'published',
    '{"tags": ["Metrology", "Quality", "Precision"]}'
)
ON CONFLICT (slug) DO NOTHING;
