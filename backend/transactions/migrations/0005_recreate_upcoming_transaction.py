# Generated manually to recreate UpcomingTransaction table

import django.core.validators
import django.db.models.deletion
from decimal import Decimal
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transactions', '0004_alter_category_options_category_type'),
    ]

    operations = [
        # Remove old UpcomingTransaction
        migrations.DeleteModel(
            name='UpcomingTransaction',
        ),

        # Create new UpcomingTransaction with updated fields
        migrations.CreateModel(
            name='UpcomingTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.CharField(max_length=255)),
                ('amount', models.DecimalField(
                    decimal_places=2,
                    max_digits=10,
                    validators=[django.core.validators.MinValueValidator(Decimal('0.01'))]
                )),
                ('scheduled_date', models.DateField()),
                ('type', models.CharField(choices=[('income', 'Income'), ('expense', 'Expense')], max_length=10)),
                ('is_posted', models.BooleanField(default=False)),
                ('auto_post', models.BooleanField(default=True)),
                ('is_recurring', models.BooleanField(default=False)),
                ('recurrence_pattern', models.CharField(
                    blank=True,
                    choices=[
                        ('daily', 'Daily'),
                        ('weekly', 'Weekly'),
                        ('biweekly', 'Biweekly'),
                        ('monthly', 'Monthly'),
                        ('yearly', 'Yearly')
                    ],
                    max_length=10,
                    null=True
                )),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('category', models.ForeignKey(
                    on_delete=django.db.models.deletion.PROTECT,
                    related_name='upcoming_transactions',
                    to='transactions.category'
                )),
                ('wallet', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='upcoming_transactions',
                    to='transactions.wallet'
                )),
            ],
            options={
                'ordering': ['scheduled_date', '-created_at'],
                'indexes': [
                    models.Index(fields=['scheduled_date', 'is_posted'], name='transaction_schedul_3f5e43_idx'),
                    models.Index(fields=['wallet', 'scheduled_date'], name='transaction_wallet__c56f1f_idx'),
                ],
            },
        ),
    ]
