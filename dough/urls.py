"""
URL configuration for dough project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from transactions.views import (
    dashboard,
    add_expense,
    add_income,
    transactions_log,
    categories_log,
    add_suggested_categories,
    add_suggested_category,
    edit_category,
    delete_category,
    edit_transaction,
    delete_transaction,
    wallet_list,
    wallet_create,
    wallet_edit,
    wallet_delete,
    add_transfer,
    edit_transfer,
    delete_transfer,
    budget_log,
    budget_create,
    budget_edit,
    budget_delete,
)

urlpatterns = [
    # Dashboard
    path('', dashboard, name='dashboard'),

    # Transaction forms
    path('add-expense/', add_expense, name='add_expense'),
    path('add-income/', add_income, name='add_income'),
    path('transactions/', transactions_log, name='transactions_log'),
    path('transactions/<int:pk>/edit/', edit_transaction, name='edit_transaction'),
    path('transactions/<int:pk>/delete/', delete_transaction, name='delete_transaction'),

    # Categories
    path('categories/', categories_log, name='categories_log'),
    path('categories/add-categories/', add_suggested_categories, name='add_suggested_categories'),
    path('categories/add-suggested/', add_suggested_category, name='add_suggested_category'),
    path('categories/<int:pk>/edit/', edit_category, name='edit_category'),
    path('categories/<int:pk>/delete/', delete_category, name='delete_category'),

    # Wallets
    path('wallets/', wallet_list, name='wallet_list'),
    path('wallets/create/', wallet_create, name='wallet_create'),
    path('wallets/<int:pk>/edit/', wallet_edit, name='wallet_edit'),
    path('wallets/<int:pk>/delete/', wallet_delete, name='wallet_delete'),

    # Transfers
    path('add-transfer/', add_transfer, name='add_transfer'),
    path('transfers/<int:pk>/edit/', edit_transfer, name='edit_transfer'),
    path('transfers/<int:pk>/delete/', delete_transfer, name='delete_transfer'),

    # Budgets
    path('budgets/', budget_log, name='budget_log'),
    path('budgets/create/', budget_create, name='budget_create'),
    path('budgets/<int:pk>/edit/', budget_edit, name='budget_edit'),
    path('budgets/<int:pk>/delete/', budget_delete, name='budget_delete'),

    # Admin
    path('admin/', admin.site.urls),

    # API
    path('api/', include('transactions.urls')),
]
