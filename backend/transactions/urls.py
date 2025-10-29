from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WalletViewSet,
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    UpcomingTransactionViewSet,
    TransferViewSet,
    WishlistItemViewSet,
    monthly_summary
)
from .api_views import DashboardAPIView

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'upcoming-transactions', UpcomingTransactionViewSet, basename='upcoming-transaction')
router.register(r'transfers', TransferViewSet, basename='transfer')
router.register(r'wishlist-items', WishlistItemViewSet, basename='wishlist-item')

urlpatterns = [
    # Dashboard API
    path('dashboard/', DashboardAPIView.as_view(), name='api-dashboard'),

    # Insights API
    path('insights/monthly-summary/', monthly_summary, name='monthly-summary'),

    # API routes
    path('', include(router.urls)),
]
