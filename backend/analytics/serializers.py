"""
Serializers for the analytics app.
"""

from rest_framework import serializers
from analytics.models import MonthlySummary


class MonthlySummarySerializer(serializers.ModelSerializer):
    """
    Serializer for MonthlySummary model.

    Serializes all fields including JSON fields for category breakdowns
    and wallet snapshots.
    """

    class Meta:
        model = MonthlySummary
        fields = [
            'id',
            'year',
            'month',
            'total_income',
            'total_expenses',
            'net_surplus',
            'savings_rate',
            'wallets_snapshot',
            'liquid_balance',
            'reserved_balance',
            'total_balance',
            'spent_per_categories',
            'last_updated',
            'is_current_month',
        ]
        read_only_fields = [
            'id',
            'total_income',
            'total_expenses',
            'net_surplus',
            'savings_rate',
            'wallets_snapshot',
            'liquid_balance',
            'reserved_balance',
            'total_balance',
            'spent_per_categories',
            'last_updated',
            'is_current_month',
        ]
