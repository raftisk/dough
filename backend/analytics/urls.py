"""
URL configuration for analytics app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from analytics.views import MonthlySummaryViewSet, current_month_summary

router = DefaultRouter()
router.register(r'monthly-summaries', MonthlySummaryViewSet, basename='monthly-summary')

urlpatterns = [
    # Standalone current month endpoint
    path('current-month/', current_month_summary, name='current-month-summary'),

    # Router URLs (includes /monthly-summaries/, /monthly-summaries/current-month/, /monthly-summaries/insights/)
    path('', include(router.urls)),
]
