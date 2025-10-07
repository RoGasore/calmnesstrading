from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import UserProfile, EmailVerificationToken
from django.utils import timezone
from datetime import timedelta
import secrets

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), lookup='iexact')])
    username = serializers.CharField(validators=[UniqueValidator(queryset=User.objects.all(), lookup='iexact')])
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_url = serializers.URLField(write_only=True, required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    telegram_username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "phone", "telegram_username", "confirm_url"]

    def validate(self, attrs):
        attrs["username"] = attrs["username"].strip()
        attrs["email"] = attrs["email"].strip().lower()
        attrs["first_name"] = (attrs.get("first_name") or "").strip()
        attrs["last_name"] = (attrs.get("last_name") or "").strip()
        attrs["phone"] = (attrs.get("phone") or "").strip()
        attrs["telegram_username"] = (attrs.get("telegram_username") or "").strip()
        return attrs

    def create(self, validated_data):
        confirm_url = validated_data.pop("confirm_url", None)
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.is_verified = False
        user.save()
        print(f"SERIALIZER: Utilisateur créé: {user.email}")
        
        # Créer le profil utilisateur
        UserProfile.objects.create(user=user)
        print("SERIALIZER: Profil utilisateur créé")
        
        # Créer un token de vérification
        token = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(hours=24)
        verification_token = EmailVerificationToken.objects.create(
            user=user,
            token=token,
            expires_at=expires_at
        )
        print(f"SERIALIZER: Token de vérification créé: {verification_token.token[:10]}...")
        
        return user

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    profile_complete = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "full_name", 
            "phone", "telegram_username", "discord_username", "whatsapp_number",
            "is_staff", "is_verified", "can_make_payment", "profile_complete", "created_at"
        ]
    
    def get_profile_complete(self, obj):
        return obj.has_complete_profile()

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = "__all__"

class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    is_verified = serializers.ReadOnlyField()
    created_at = serializers.ReadOnlyField()
    last_login = serializers.ReadOnlyField()
    profile_complete = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "full_name", 
            "phone", "telegram_username", "discord_username", "whatsapp_number",
            "is_staff", "is_active", "is_verified", "can_make_payment", "profile_complete",
            "created_at", "last_login", "date_joined"
        ]
    
    def get_profile_complete(self, obj):
        return obj.has_complete_profile()


