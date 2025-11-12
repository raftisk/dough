from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, Q, Case, When, F
from decimal import Decimal
from datetime import date
from dateutil.relativedelta import relativedelta

from .models import Wallet, Transaction, Budget
from .serializers import TransactionSerializer, BudgetSerializer


class DashboardAPIView(APIView):
    """
    Dashboard API endpoint to return summary data for the dashboard page.
    """

    def get(self, request):
        # Calculate current month start and end dates
        today = date.today()
        current_month_start = today.replace(day=1)
        # Get last day of current month
        next_month = current_month_start + relativedelta(months=1)
        current_month_end = next_month - relativedelta(days=1)

        # Current month income (sum of all income transactions this month) - filter by user
        current_month_income = Transaction.objects.filter(
            wallet__user=request.user,
            type='income',
            date__gte=current_month_start,
            date__lte=current_month_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Current month expenses (sum of all expense transactions this month) - filter by user
        current_month_expenses = Transaction.objects.filter(
            wallet__user=request.user,
            type='expense',
            date__gte=current_month_start,
            date__lte=current_month_end
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # Net savings (income - expenses)
        net_savings = current_month_income - current_month_expenses

        # Total balance across all user's wallets
        wallets = Wallet.objects.filter(user=request.user)
        total_balance = sum(wallet.get_current_balance() for wallet in wallets)

        # Recent transactions (last 10) - filter by user
        recent_transactions = Transaction.objects.filter(
            wallet__user=request.user
        ).select_related(
            'wallet', 'category'
        ).order_by('-date', '-created_at')[:10]
        recent_transactions_data = TransactionSerializer(recent_transactions, many=True).data

        # Wallet count - filter by user
        wallet_count = Wallet.objects.filter(user=request.user).count()

        # Transaction count this month - filter by user
        transaction_count = Transaction.objects.filter(
            wallet__user=request.user,
            date__gte=current_month_start,
            date__lte=current_month_end
        ).count()

        # Prepare response data
        data = {
            'current_month_income': str(current_month_income),
            'current_month_expenses': str(current_month_expenses),
            'net_savings': str(net_savings),
            'total_balance': str(total_balance),
            'recent_transactions': recent_transactions_data,
            'wallet_count': wallet_count,
            'transaction_count': transaction_count,
        }

        return Response(data, status=status.HTTP_200_OK)
