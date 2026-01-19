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
VALUES (
  'Fluxo de Validacao de Fadiga',
  'Guia 3D + CNC para implantes ortopedicos com checklist tecnico.',
  'Guia completo de validacao de fadiga para implantes ortopedicos.',
  'guide',
  'Engenharia de Produto / QA',
  'published',
  'fatigue-validation-guide',
  '{"featured": true, "route": "/resources/fatigue-validation-guide"}'::jsonb
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
