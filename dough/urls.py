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
    add_suggested_category,
    edit_category,
    delete_category,
    edit_transaction,
    delete_transaction,
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
    path('categories/add-suggested/', add_suggested_category, name='add_suggested_category'),
    path('categories/<int:pk>/edit/', edit_category, name='edit_category'),
    path('categories/<int:pk>/delete/', delete_category, name='delete_category'),

    # Admin
    path('admin/', admin.site.urls),

    # API
    path('api/', include('transactions.urls')),
]
