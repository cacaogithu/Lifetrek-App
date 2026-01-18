# LinkedIn Carousel Generation - Batch Script
# Run this to generate all 6 carousels for January 2026 campaign

SUPABASE_URL="https://iijkbhiqcsvtnfernrbs.supabase.co"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/generate-linkedin-carousel"
AUTH_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpamtiaGlxY3N2dG5mZXJucmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTE2MzUsImV4cCI6MjA3NTkyNzYzNX0.HQJ1vRWwn7YXmWDvb9Pf_JgzeyCDOpXdf2NI-76IUbM"

echo "🚀 Generating 6 LinkedIn Carousels for January 2026 Campaign"
echo "============================================================"
echo ""

# POST 1: Custo Real da Importação
echo "📝 Generating Post 1: Custo Real da Importação..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "O Custo Real da Importação de Implantes Médicos",
  "targetAudience": "Fabricantes de dispositivos médicos, Procurement, CFOs",
  "painPoint": "Dependência de importação, capital parado 20-30% em estoque, lead time 90 dias vs 30 dias local, custos ocultos de alfândega",
  "desiredOutcome": "Awareness sobre TCO total e posicionamento de fabricação local da Lifetrek como alternativa estratégica",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 1 complete!"
echo ""
sleep 5

# POST 2: 7 Pontos de Validação
echo "📝 Generating Post 2: 7 Pontos de Validação..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "7 Pontos de Validação Que Todo Fornecedor Médico Deve Passar",
  "targetAudience": "Quality Managers, Procurement, Regulatory Affairs",
  "painPoint": "Dificuldade em qualificar fornecedores confiáveis, risco de não-conformidade, auditorias complexas",
  "desiredOutcome": "Education sobre critérios técnicos e posicionamento da Lifetrek como expert (não vendedor)",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 2 complete!"
echo ""
sleep 5

# POST 3: Por Que Tudo Sob Um Teto
echo "📝 Generating Post 3: Por Que Trouxemos Tudo Sob Um Teto..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "Por Que Trouxemos Usinagem, Acabamento, Metrologia e Embalagem Para Dentro da Lifetrek",
  "targetAudience": "OEMs, Procurement, Operations Directors",
  "painPoint": "Coordenar múltiplos fornecedores, lack of supply chain visibility, problemas de rastreabilidade",
  "desiredOutcome": "Demonstrar visão estratégica de integração vertical e benefício de single-source supplier",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 3 complete!"
echo ""
sleep 5

# POST 4: Swiss Turning vs CNC
echo "📝 Generating Post 4: Swiss Turning vs CNC Convencional..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "Swiss Turning vs CNC Convencional: Por Que Importa Para Implantes Médicos",
  "targetAudience": "R&D Engineers, Manufacturing Engineers, Technical Directors",
  "painPoint": "Falta de expertise técnico em fornecedores, tolerâncias inadequadas, acabamento superficial ruim",
  "desiredOutcome": "Educação técnica profunda e diferenciação da Lifetrek de job shops genéricos",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 4 complete!"
echo ""
sleep 5

# POST 5: Fornecedor Que Não Freia P&D
echo "📝 Generating Post 5: O Fornecedor Que Nunca Freia Seu P&D..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "O Fornecedor Que Nunca Freia Seu P&D: Co-Engineering na Prática",
  "targetAudience": "R&D Teams, Product Development, Innovation Directors",
  "painPoint": "Designs bloqueados por limitações de fornecedor, 'não dá para fabricar isso', ciclos de inovação lentos",
  "desiredOutcome": "Posicionar Lifetrek como co-engineering partner que habilita inovação, não como job shop transacional",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 5 complete!"
echo ""
sleep 5

# POST 6: Indicadores de Risco 2026
echo "📝 Generating Post 6: Indicadores de Risco de Fornecimento 2026..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d @- << 'EOF'
{
  "topic": "Três Indicadores Que Seu Fornecedor Atual Pode Comprometer Seus Objetivos de Qualidade em 2026",
  "targetAudience": "Quality Managers, Procurement, Supply Chain Directors",
  "painPoint": "Problemas de fornecedor não detectados, riscos regulatórios, custos de firefighting",
  "desiredOutcome": "Gerar leads de empresas planejando qualification ou troca de fornecedores em Q1 2026",
  "mode": "generate"
}
EOF

echo ""
echo "✅ Post 6 complete!"
echo ""

echo "============================================================"
echo "🎉 All 6 carousels generated successfully!"
echo ""
echo "Next steps:"
echo "1. Check the database for generated carousels"
echo "2. Review and approve content"
echo "3. Schedule posts according to calendar"
echo ""
