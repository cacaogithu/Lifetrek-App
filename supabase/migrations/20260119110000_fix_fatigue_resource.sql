-- Fix the Fatigue Validation Guide resource entry (correct column order)
DELETE FROM public.resources WHERE slug = 'fatigue-validation-guide';

INSERT INTO public.resources (
    title,
    description,
    content,
    type,
    persona,
    status,
    slug,
    metadata,
    created_at,
    updated_at
) VALUES (
    'Fluxo de Validação de Fadiga',
    'Guia passo-a-passo para validar implantes ortopédicos: da prototipagem 3D à usinagem CNC e ensaios mecânicos. Reduza ciclos de falha.',
    'Consulte a página dedicada para o fluxograma interativo e checklist completo.',
    'guide',
    'Engenharia/P&D',
    'published',
    'fatigue-validation-guide',
    '{"icon": "activity", "readTime": "5 min"}'::jsonb,
    now(),
    now()
);
