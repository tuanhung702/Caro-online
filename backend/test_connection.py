#!/usr/bin/env python3
# File: backend/test_connection.py
"""Script để test kết nối Supabase"""

import os
import sys
from dotenv import load_dotenv

# Load .env
load_dotenv()

def test_supabase_connection():
    """Test kết nối Supabase"""
    print("🔍 Testing Supabase connection...\n")
    
    # Kiểm tra environment variables
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_key:
        print("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env")
        print("   Please copy .env.example to .env and fill in your credentials")
        return False
    
    print(f"✅ SUPABASE_URL: {supabase_url[:50]}...")
    print(f"✅ SERVICE_KEY: {supabase_key[:50]}...\n")
    
    # Import và kết nối
    try:
        from supabase import create_client
        supabase = create_client(supabase_url, supabase_key)
        print("✅ Supabase client created\n")
        
        # Test read from tables (try common name variants)
        print("Testing database tables...")

        def check_table(possible_names):
            """Try each name in possible_names and return (found_name, result) or (None, error)."""
            last_err = None
            for name in possible_names:
                    try:
                        # Use a lightweight select with limit to check table existence
                        result = supabase.table(name).select('*').limit(1).execute()
                        return name, result
                    except Exception as e:
                        last_err = e
            return None, last_err

        # Profiles (could be 'profiles' or 'Profiles')
        name, res = check_table(['profiles', 'Profiles'])
        if name:
            print(f"✅ {name} table exists (rows sample check OK)")
        else:
            print(f"❌ profiles table error: {res}")
            print("   Run SQL from DATABASE_SETUP.md to create tables (note: table names are case-sensitive if quoted)")
            return False

        # Match history (could be 'match_history' or 'MatchHistory')
        name, res = check_table(['match_history', 'MatchHistory'])
        if name:
            print(f"✅ {name} table exists (rows sample check OK)")
        else:
            print(f"❌ match_history table error: {res}")
            print("   Run SQL from DATABASE_SETUP.md to create tables (note: table names are case-sensitive if quoted)")
            return False

        # Users table
        name, res = check_table(['users', 'Users'])
        if name:
            print(f"✅ {name} table exists (rows sample check OK)")
        else:
            print(f"⚠️ Users table not found: {res}")
            print("   If you manage users in Supabase Auth, this may be expected. Otherwise create 'Users' table or adjust DATABASE_SETUP.md")
        
        print("\n✅ All tests passed! Backend is ready to run.")
        return True
        
    except ImportError:
        print("❌ supabase package not installed")
        print("   Run: pip install -r requirements.txt")
        return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False


if __name__ == "__main__":
    success = test_supabase_connection()
    sys.exit(0 if success else 1)
