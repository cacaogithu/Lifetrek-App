"""
Quick Demo: Test database sync and see real-time updates
Creates a few sample leads and updates them, showing data in the frontend
"""

import sys
import os
import time

# Add utils to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'utils'))
from db_writer import LeadDBWriter

def demo_database_sync():
    """Demo: Create and update leads, see them appear in real-time"""
    
    print("🚀 Lead Database Sync Demo")
    print("=" * 60)
    print("📱 Open http://localhost:8081/admin/leads in your browser")
    print("   to see the data update in REAL-TIME!")
    print("=" * 60)
    print()
    
    # Initialize database writer
    print("🔌 Connecting to database...")
    db = LeadDBWriter()
    print("✅ Connected!\n")
    
    # Sample leads
    sample_leads = [
        {
            'nome_empresa': 'MedTech Brasil Ltda',
            'website': 'https://medtech.com.br',
            'telefone': '+55 11 1234-5678',
            'segmento': 'Orthopedic Implants',
            'categoria': 'Manufacturer',
            'has_iso': True,
            'has_ce': True,
            'employee_count': 150,
            'v2_score': 8.5,
            'enrichment_status': 'pending',
            'priority': 'high',
            'source': 'demo_script'
        },
        {
            'nome_empresa': 'Dental Solutions SP',
            'website': 'https://dentalsolutions.com',
            'telefone': '+55 11 9876-5432',
            'segmento': 'Dental Implants',
            'categoria': 'Distributor',
            'has_iso': True,
            'employee_count': 45,
            'v2_score': 7.2,
            'enrichment_status': 'pending',
            'priority': 'medium',
            'source': 'demo_script'
        },
        {
            'nome_empresa': 'BioMed Equipamentos',
            'website': 'https://biomed.ind.br',
            'telefone': '+55 19 3333-4444',
            'segmento': 'Medical Equipment',
            'categoria': 'Manufacturer',
            'has_iso': True,
            'has_fda': True,
            'has_ce': True,
            'employee_count': 320,
            'v2_score': 9.1,
            'enrichment_status': 'pending',
            'priority': 'urgent',
            'source': 'demo_script'
        }
    ]
    
    # Step 1: Create leads
    print("📝 Step 1: Creating 3 sample leads...")
    result = db.upsert_leads_batch(sample_leads)
    print(f"   ✅ Created {result['success']} leads")
    print(f"   🌐 Check your browser - they should appear now!\n")
    
    input("Press Enter to continue with enrichment simulation...")
    
    # Step 2: Simulate enrichment process
    print("\n🔍 Step 2: Simulating enrichment process...")
    
    for i, lead in enumerate(sample_leads, 1):
        nome_empresa = lead['nome_empresa']
        
        print(f"\n   [{i}/3] Processing: {nome_empresa}")
        
        # Update to in_progress
        print(f"      ⏳ Status: in_progress")
        db.update_enrichment_status(nome_empresa, 'in_progress')
        time.sleep(1)  # Pause so you can see the update
        
        # Add email
        fake_email = f"contato@{nome_empresa.lower().replace(' ', '')}.com"
        print(f"      📧 Found email: {fake_email}")
        db.add_scraped_email(nome_empresa, fake_email)
        time.sleep(1)
        
        # Add LinkedIn
        fake_linkedin = f"https://linkedin.com/company/{nome_empresa.lower().replace(' ', '-')}"
        print(f"      💼 Found LinkedIn: {fake_linkedin}")
        db.add_linkedin_profile(nome_empresa, fake_linkedin)
        time.sleep(1)
        
        # Update indicators
        print(f"      🏢 Updating company indicators...")
        db.update_company_indicators(nome_empresa, {
            'has_rd': True,
            'years_in_business': 15 + i * 5,
            'countries_served': 3 + i
        })
        time.sleep(1)
        
        # Mark as complete
        print(f"      ✅ Status: complete")
        db.update_enrichment_status(nome_empresa, 'complete', 'Demo enrichment completed')
        
        print(f"      🌐 Check your browser - updates should be visible!")
        time.sleep(2)
    
    # Final summary
    print("\n" + "=" * 60)
    print("🎉 Demo Complete!")
    print("=" * 60)
    print()
    print("📊 Summary:")
    print(f"   • Created 3 sample leads")
    print(f"   • Added emails and LinkedIn profiles")
    print(f"   • Updated company indicators")
    print(f"   • Changed status from pending → in_progress → complete")
    print()
    print("💡 All changes should be visible in your browser at:")
    print("   http://localhost:8081/admin/leads")
    print()
    print("🔄 The spreadsheet updates automatically via real-time sync!")
    print()
    print("=" * 60)

if __name__ == "__main__":
    try:
        demo_database_sync()
    except KeyboardInterrupt:
        print("\n\n⚠️  Demo interrupted")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("  1. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env")
        print("  2. The database migration has been applied")
        print("  3. The dev server is running (npm run dev)")
