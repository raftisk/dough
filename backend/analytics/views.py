"""
API views for the analytics app.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import date

from analytics.models import MonthlySummary
from analytics.serializers import MonthlySummarySerializer
from analytics.services.summary import get_current_month_summary, update_monthly_summary


class MonthlySummaryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for MonthlySummary model.

    Provides read-only access to monthly summaries for the authenticated user.
    Summaries are automatically calculated via signals.
    """
    serializer_class = MonthlySummarySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter monthly summaries by current user"""
        return MonthlySummary.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def current_month(self, request):
        """
        Get current month summary for the authenticated user.

        Endpoint: GET /api/analytics/monthly-summaries/current-month/

        Returns: MonthlySummary object for current month
        """
        summary = get_current_month_summary(request.user)
        serializer = self.get_serializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def insights(self, request):
        """
        Get monthly summaries formatted for Insights page.

        Endpoint: GET /api/analytics/monthly-summaries/insights/

        Query params:
        - year (optional): Year to fetch data for (default: current year)
        - months (optional): Number of months to return (default: 12)

        Returns: Array of monthly data matching the old monthly_summary() format:
        [
            {
                "month": "2025-01",
                "total_income": "3200.00",
                "total_expenses": "2800.50",
                "net_savings": "399.50"
            },
            ...
        ]
        """
        # Get query parameters
        year_param = request.query_params.get('year', None)
        months_param = request.query_params.get('months', 12)

        try:
            year = int(year_param) if year_param else date.today().year
            num_months = int(months_param)
        except (ValueError, TypeError):
            return Response(
                {'error': 'Invalid year or months parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create summaries for all 12 months
        monthly_data = []

        for month in range(1, 13):
            # Try to get existing summary, or create if doesn't exist
            try:
                summary = MonthlySummary.objects.get(
                    user=request.user,
                    year=year,
                    month=month
                )
            except MonthlySummary.DoesNotExist:
                # Create summary if it doesn't exist
                summary = update_monthly_summary(request.user, year, month)

            # Format month as YYYY-MM
            month_str = f"{year}-{month:02d}"

            monthly_data.append({
                'month': month_str,
                'total_income': str(summary.total_income),
                'total_expenses': str(summary.total_expenses),
                'net_savings': str(summary.net_surplus)  # Note: using net_surplus for backward compatibility
            })

        return Response(monthly_data)


@api_view(['GET'])
def current_month_summary(request):
    """
    Standalone endpoint for current month summary.

    Endpoint: GET /api/analytics/current-month/

    Returns: Current month MonthlySummary object with comparison to previous month
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    summary = get_current_month_summary(request.user)
    serializer = MonthlySummarySerializer(summary)
    data = serializer.data

    # Calculate previous month for comparison
    prev_month = summary.month - 1 if summary.month > 1 else 12
    prev_year = summary.year if summary.month > 1 else summary.year - 1

    # Try to fetch previous month summary
    try:
        prev_summary = MonthlySummary.objects.get(
            user=request.user,
            year=prev_year,
            month=prev_month
        )

        # Calculate income trend (percentage change)
        if prev_summary.total_income > 0:
            income_trend = ((summary.total_income - prev_summary.total_income) / prev_summary.total_income) * 100
        elif summary.total_income > 0:
            income_trend = 100  # If previous was 0 and now has income, it's 100% increase
        else:
            income_trend = 0

        # Calculate expenses trend (percentage change)
        if prev_summary.total_expenses > 0:
            expenses_trend = ((summary.total_expenses - prev_summary.total_expenses) / prev_summary.total_expenses) * 100
        elif summary.total_expenses > 0:
            expenses_trend = 100  # If previous was 0 and now has expenses, it's 100% increase
        else:
            expenses_trend = 0

        data['income_trend'] = float(income_trend)
        data['expenses_trend'] = float(expenses_trend)

    except MonthlySummary.DoesNotExist:
        # No previous month data available
        data['income_trend'] = None
        data['expenses_trend'] = None

    return Response(data)
