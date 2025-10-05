#!/usr/bin/env python
import os
import sys
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from accounts.serializers import RegisterSerializer
from accounts.models import User

def test_register():
    # Test data
    test_data = {
        'username': 'testuser123',
        'email': 'test@example.com',
        'password': 'testpassword123',
        'first_name': 'Test',
        'last_name': 'User',
        'phone': '',
        'telegram_username': ''
    }
    
    print("Testing registration with data:")
    print(test_data)
    print()
    
    # Test serializer validation
    serializer = RegisterSerializer(data=test_data)
    print("Serializer validation:")
    print(f"Valid: {serializer.is_valid()}")
    if not serializer.is_valid():
        print("Errors:")
        for field, errors in serializer.errors.items():
            print(f"  {field}: {errors}")
        return
    
    print("Serializer is valid!")
    
    # Test user creation
    try:
        user = serializer.save()
        print(f"User created successfully: {user.email}")
        print(f"User active: {user.is_active}")
        print(f"User verified: {user.is_verified}")
        
        # Clean up
        user.delete()
        print("Test user cleaned up")
        
    except Exception as e:
        print(f"Error creating user: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_register()
