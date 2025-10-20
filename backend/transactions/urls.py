from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    dashboard,
    add_expense,
    add_income,
    transactions_log,
    categories_log,
    add_suggested_category,
    edit_category,
    delete_category,
    edit_transaction,
    delete_transaction,
    WalletViewSet,
    CategoryViewSet,
    TransactionViewSet,
    BudgetViewSet,
    UpcomingTransactionViewSet
)
from .api_views import DashboardAPIView

router = DefaultRouter()
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'upcoming-transactions', UpcomingTransactionViewSet, basename='upcoming-transaction')

urlpatterns = [
    # Dashboard API
    path('dashboard/', DashboardAPIView.as_view(), name='api-dashboard'),

    # API routes
    path('', include(router.urls)),
]
