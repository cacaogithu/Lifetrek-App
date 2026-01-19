-- Insert the Fatigue Validation Guide into the resources table
INSERT INTO public.resources (
    title,
    description,
    content,
    type,
    persona,
    status,
    slug,
    metadata
) VALUES (
    'Fluxo de Validação de Fadiga',
    'Guia passo-a-passo para validar implantes ortopédicos: da prototipagem 3D à usinagem CNC e ensaios mecânicos. Reduza ciclos de falha.',
    'Consulte a página dedicada para o fluxograma interativo e checklist completo.',
    'guide',
    'Engenharia/P&D',
    'published',
    'fatigue-validation-guide',
    '{"icon": "activity", "readTime": "5 min"}'
) ON CONFLICT (slug) DO UPDATE SET 
    title = EXCLUDED.title,
    description = EXCLUDED.description;
