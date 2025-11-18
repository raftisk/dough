from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserPreferences


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - returns user profile data"""

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'date_joined', 'is_active']
        read_only_fields = ['id', 'date_joined', 'is_active']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm']

    def validate(self, data):
        """Validate passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def validate_email(self, value):
        """Validate email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        """Create new user with hashed password"""
        # Remove password_confirm as it's not needed for user creation
        validated_data.pop('password_confirm')

        # Use the custom user manager's create_user method
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        """Validate user credentials"""
        email = data.get('email')
        password = data.get('password')

        if email and password:
            # Authenticate using email instead of username
            user = authenticate(request=self.context.get('request'), username=email, password=password)

            if not user:
                raise serializers.ValidationError('Invalid email or password.')

            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')

            data['user'] = user
        else:
            raise serializers.ValidationError('Must include "email" and "password".')

        return data


class UserPreferencesSerializer(serializers.ModelSerializer):
    """Serializer for UserPreferences model"""
    default_wallet_name = serializers.CharField(source='default_wallet.name', read_only=True)

    class Meta:
        model = UserPreferences
        fields = [
            'default_currency',
            'default_wallet',
            'default_wallet_name',
            'theme',
            'smart_allocation',
            'multi_currency',
            'amount_format',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
