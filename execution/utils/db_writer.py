"""
Supabase Database Writer Helper
Simplifies writing lead data to Supabase from enrichment scripts
"""

import os
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LeadDBWriter:
    """Helper class for writing leads to Supabase database"""
    
    def __init__(self):
        """Initialize Supabase client"""
        supabase_url = os.getenv("SUPABASE_URL")
        service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not supabase_url or not service_role_key:
            raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
        
        self.supabase: Client = create_client(supabase_url, service_role_key)
    
    def upsert_lead(self, lead_data: Dict[str, Any]) -> bool:
        """
        Insert or update a single lead
        Returns True if successful, False otherwise
        """
        try:
            response = self.supabase.table('leads').upsert(
                lead_data,
                on_conflict='nome_empresa'
            ).execute()
            return True
        except Exception as e:
            print(f"❌ Error upserting lead {lead_data.get('nome_empresa', 'Unknown')}: {e}")
            return False
    
    def upsert_leads_batch(self, leads: List[Dict[str, Any]], batch_size: int = 50) -> Dict[str, int]:
        """
        Insert or update multiple leads in batches
        Returns dict with success and error counts
        """
        total = len(leads)
        success_count = 0
        error_count = 0
        
        for i in range(0, total, batch_size):
            batch = leads[i:i + batch_size]
            try:
                response = self.supabase.table('leads').upsert(
                    batch,
                    on_conflict='nome_empresa'
                ).execute()
                
                success_count += len(batch)
                batch_num = (i // batch_size) + 1
                total_batches = (total + batch_size - 1) // batch_size
                print(f"✅ Batch {batch_num}/{total_batches}: Uploaded {len(batch)} leads")
                
            except Exception as e:
                error_count += len(batch)
                print(f"❌ Error uploading batch: {e}")
        
        return {
            'success': success_count,
            'errors': error_count,
            'total': total
        }
    
    def update_enrichment_status(self, nome_empresa: str, status: str, notes: Optional[str] = None) -> bool:
        """
        Update enrichment status for a lead
        Status: pending, in_progress, complete, failed
        """
        try:
            update_data = {'enrichment_status': status}
            if notes:
                update_data['notes'] = notes
            
            self.supabase.table('leads').update(update_data).eq('nome_empresa', nome_empresa).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating status for {nome_empresa}: {e}")
            return False
    
    def add_scraped_email(self, nome_empresa: str, email: str) -> bool:
        """Add an email to a lead's scraped_emails array"""
        try:
            # Get current lead
            response = self.supabase.table('leads').select('scraped_emails').eq('nome_empresa', nome_empresa).single().execute()
            
            current_emails = response.data.get('scraped_emails', []) if response.data else []
            
            # Add email if not already present
            if email not in current_emails:
                current_emails.append(email)
                self.supabase.table('leads').update({
                    'scraped_emails': current_emails
                }).eq('nome_empresa', nome_empresa).execute()
            
            return True
        except Exception as e:
            print(f"❌ Error adding email for {nome_empresa}: {e}")
            return False
    
    def add_linkedin_profile(self, nome_empresa: str, linkedin_url: str) -> bool:
        """Add a LinkedIn profile to a lead's linkedin_profiles array"""
        try:
            response = self.supabase.table('leads').select('linkedin_profiles').eq('nome_empresa', nome_empresa).single().execute()
            
            current_profiles = response.data.get('linkedin_profiles', []) if response.data else []
            
            if linkedin_url not in current_profiles:
                current_profiles.append(linkedin_url)
                self.supabase.table('leads').update({
                    'linkedin_profiles': current_profiles
                }).eq('nome_empresa', nome_empresa).execute()
            
            return True
        except Exception as e:
            print(f"❌ Error adding LinkedIn for {nome_empresa}: {e}")
            return False
    
    def update_company_indicators(self, nome_empresa: str, indicators: Dict[str, Any]) -> bool:
        """
        Update company indicators (has_fda, has_ce, has_iso, etc.)
        Example: {'has_fda': True, 'has_iso': True, 'employee_count': 250}
        """
        try:
            self.supabase.table('leads').update(indicators).eq('nome_empresa', nome_empresa).execute()
            return True
        except Exception as e:
            print(f"❌ Error updating indicators for {nome_empresa}: {e}")
            return False
    
    def get_pending_leads(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get leads with pending enrichment status"""
        try:
            query = self.supabase.table('leads').select('*').eq('enrichment_status', 'pending')
            
            if limit:
                query = query.limit(limit)
            
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"❌ Error fetching pending leads: {e}")
            return []


# Convenience function for quick writes
def write_lead_to_db(lead_data: Dict[str, Any]) -> bool:
    """Quick function to write a single lead to database"""
    writer = LeadDBWriter()
    return writer.upsert_lead(lead_data)


def write_leads_to_db(leads: List[Dict[str, Any]]) -> Dict[str, int]:
    """Quick function to write multiple leads to database"""
    writer = LeadDBWriter()
    return writer.upsert_leads_batch(leads)
