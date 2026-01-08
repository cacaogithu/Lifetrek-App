import os
import time
import random
import requests
from datetime import datetime
import pytz
from supabase import create_client, Client

# --- Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Must use Service Role to access all tables safely
UNIPILE_DSN = os.environ.get("UNIPILE_DSN")

class AutomationGovernor:
    def __init__(self, user_id):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.user_id = user_id
        self.tz_brazil = pytz.timezone('America/Sao_Paulo')

    def allowed_time_window(self):
        """Checks if current time is within acceptable business hours (9am-6pm) and not lunch (12-2pm)."""
        now = datetime.now(self.tz_brazil)
        
        # 1. Weekend Check
        if now.weekday() >= 5: # 5=Saturday, 6=Sunday
            print(f"Governor: Blocked - Weekend ({now.strftime('%A')})")
            return False

        # 2. Hour Check (9:00 - 18:00)
        hour = now.hour
        if hour < 9 or hour >= 18:
            print(f"Governor: Blocked - Outside Business Hours ({hour}:00)")
            return False

        # 3. Lunch Check (12:00 - 14:00)
        if 12 <= hour < 14:
            print(f"Governor: Blocked - Lunch Break")
            return False

        return True

    def check_limit(self, action_type):
        """Calls the Database Function to check daily limits."""
        # Using the RPC function we created in the migration
        response = self.supabase.rpc('check_daily_limit', {
            'p_user_id': self.user_id,
            'p_action_type': action_type
        }).execute()
        
        if response.data is True:
            return True
        else:
            print(f"Governor: Blocked - Daily Limit Reached for {action_type}")
            return False

    def log_action(self, action_type, status, target_url=None):
        """Logs the attempt to the secure audit log."""
        self.supabase.table('automation_logs').insert({
            'user_id': self.user_id,
            'action_type': action_type,
            'status': status,
            'target_url': target_url
        }).execute()

    def safe_send(self, action_type, execute_func, *args, **kwargs):
        """
        The Master Wrapper.
        1. Checks Time Window
        2. Checks Database Limit
        3. Executes the Unipile Call
        4. Logs the result
        5. Sleep random jitter
        """
        print(f"Governor: Requesting to perform '{action_type}'...")

        # 1. Time Check
        if not self.allowed_time_window():
            self.log_action(action_type, 'blocked_time')
            return False

        # 2. Limit Check
        if not self.check_limit(action_type):
            self.log_action(action_type, 'blocked_limit')
            return False

        # 3. Execution
        try:
            print(f"Governor: Approved. Executing...")
            result = execute_func(*args, **kwargs)
            
            # Assuming execution success if no exception
            self.log_action(action_type, 'success')
            
            # 5. Jitter (Random sleep 5-15 mins - configurable)
            # For demo reliability we assume the caller handles long sleeps, 
            # or we do a small short sleep here to prevent accidental bursts.
            jitter = random.randint(2, 10) 
            print(f"Governor: Success. Sleeping {jitter}s jitter...")
            time.sleep(jitter)
            
            return result
            
        except Exception as e:
            print(f"Governor: Execution Failed - {str(e)}")
            self.log_action(action_type, 'failed')
            raise e

# --- Example Usage (Pseudo) ---
# governor = AutomationGovernor(user_id='uuid-of-vanessa')
# def send_unipile_linkedin_invite(profile_id):
#     # Unipile API Call here...
#     pass
#
# governor.safe_send('invite', send_unipile_linkedin_invite, profile_id='123')
