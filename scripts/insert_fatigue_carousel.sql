
-- Insert the Carousel Header
WITH new_carousel AS (
  INSERT INTO linkedin_carousels (
    topic,
    target_audience,
    pain_point,
    desired_outcome,
    proof_points,
    cta_action,
    caption,
    status,
    format,
    slides,
    image_urls,
    created_at,
    updated_at,
    admin_user_id
  ) VALUES (
    'Framework: Combinar Impressão 3D + CNC para Validar Fadiga',
    'OEMs Ortopédicos, Engenheiros de P&D',
    'Ciclos de teste de fadiga lentos e não-conformidades',
    'Validar mais rápido combinando 3D e CNC',
    'Citizen M32, Materiais Grau Implante, ISO 13485',
    'Solicitar Fluxograma de Validação',
    E'Fadiga de material é o vilão silencioso dos implantes ortopédicos.\nE validar isso rápido, sem perder confiabilidade, é o jogo que P&D e Manufatura precisam ganhar.\n\nA melhor combinação que temos visto na prática não é “3D ou CNC”, é **3D + CNC**:\n\n🔹 **Impressão 3D médica**\nPara validar geometria, encaixe, volume de material e conceito de design em dias, com baixo custo de iteração.\n\n🔹 **Usinagem CNC em materiais de grau implante**\nPara testar fadiga em condições reais, com titânio, Nitinol ou PEEK usinados em tolerâncias de mícron – exatamente como serão produzidos em série.\n\nQuando esse pipeline é bem desenhado, você:\n- Reduz ciclos de tentativa e erro,\n- Ganha dados de fadiga que valem para ANVISA/FDA,\n- Chega ao lançamento com muito menos NCG e retrabalho.\n\nNa Lifetrek Medical, integramos impressão 3D médica com usinagem Swiss‑type (Citizen M32) e ISO 13485 para que OEMs ortopédicos validem mais rápido sem abrir mão de segurança.\n\n👉 Se quiser ver o fluxograma que usamos para combinar 3D + CNC na validação de fadiga, comente **“FADIGA”** que eu envio o modelo.\n\n#Impressao3D #CNC #ImplantesOrtopedicos #FadigaDeMaterial #MedTech #ISO13485 #LifetrekMedical',
    'approved',
    'carousel',
    '[
      {
        "type": "hook",
        "headline": "FADIGA DE MATERIAL EM IMPLANTES ÓSSEOS: TESTE MAIS RÁPIDO, LANCE MAIS SEGURO.",
        "body": "Para OEMs ortopédicos, prototipagem de alta fidelidade reduz ciclos de teste e não‑conformidades.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "Extreme close-up of a medical bone implant (titanium) having a stress test. High-tech laboratory visual, dramatic lighting, blue and branding colors. Represents material fatigue testing.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      },
      {
        "type": "context",
        "headline": "DO CAD AO TESTE DE FADIGA EM SEMANAS",
        "body": "Combine impressão 3D médica para validar geometria com usinagem CNC em materiais de grau implante para testar fadiga em condições reais.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "Split visual: Left side shows a 3D printer creating a prototype, Right side shows a precision CNC machine cutting metal. Connected by a digital glowing line representing the workflow.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      },
      {
        "type": "problem/solution",
        "headline": "POR QUE AINDA PRECISAMOS DO CNC",
        "body": "Impressão 3D valida forma e conceito. Fadiga exige peça usinada em titânio, Nitinol ou PEEK, com tolerâncias de mícron – aí entra a Citizen M32.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "Close up of a Citizen M32 Swiss-type lathe machining a small precise medical implant. Sparks or cooling fluid, very technical and precise look.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      },
      {
        "type": "proof",
        "headline": "MATERIAIS CERTOS, DADOS CONFIÁVEIS",
        "body": "Nitinol, Titânio Grau Implante (ASTM F136) e PEEK, usinados sob ISO 13485:2016, geram resultados de fadiga que você pode levar para ANVISA/FDA.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "Visual composition of raw materials: Titanium bars, PEEK rods, and Nitinol wire, formatted as high-end engineering materials context. ISO 13485 stamp overlay concept.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      },
      {
        "type": "benefit",
        "headline": "MENOS ITERAÇÕES, MAIS APRENDIZADO POR LOTE",
        "body": "Pipeline 3D + CNC bem desenhado reduz ciclos de reprojeto, corta custo de teste e encurta o caminho até a validação final do implante.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "Graph or chart visual showing \"Time to Market\" decreasing and \"Learning Cycles\" increasing. Positive, growth-oriented, futuristic medical manufacturing background.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      },
      {
        "type": "cta",
        "headline": "QUER O FLUXO 3D + CNC QUE USAMOS?",
        "body": "Temos um fluxograma de validação de fadiga que mostra onde usar impressão 3D e onde usar CNC em cada etapa. Comente “FADIGA” ou fale com nossa equipe técnica para receber o modelo.",
        "backgroundType": "generate",
        "imageGenerationPrompt": "A digital tablet or blueprint showing a complex but clean flowchart titled \"Fatigue Validation Workflow\". Hand holding it or placed on an engineer''s desk.",
        "textPlacement": "burned_in",
        "imageUrl": ""
      }
    ]'::jsonb,
    ARRAY[]::text[],
    NOW(),
    NOW(),
    -- Attempt to fallback to a known admin user or NULL if allowable, 
    -- but usually RLS requires a user. 
    -- Assuming this is run as postgres/service_role in SQL Editor, we can use a dummy UUID or lookup.
    COALESCE((SELECT user_id FROM admin_users LIMIT 1), '00000000-0000-0000-0000-000000000000')
  ) RETURNING id
)
SELECT id as new_carousel_id FROM new_carousel;
